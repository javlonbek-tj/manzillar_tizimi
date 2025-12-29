import fs from 'fs';
import path from 'path';
import centroid from '@turf/centroid';
import prisma from '../../lib/prisma';

// Coordinates in streets.geojson are already in EPSG:4326 (WGS84), no conversion needed
function convertGeometry(geometry: any): any {
  // Simply return the geometry as-is since it's already in WGS84
  return geometry;
}

async function main() {
  const filePath = path.join(process.cwd(), 'prisma', 'data', 'streets.geojson');

  if (!fs.existsSync(filePath)) {
    console.error('Streets GeoJSON not found at:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(raw);

  // First, delete all existing streets
  console.log('Clearing existing streets...');
  await prisma.street.deleteMany({});

  let successCount = 0;
  let skipCount = 0;
  let invalidCoordCount = 0;

  for (const feature of geojson.features) {
    const props = feature.properties;

    // Find the parent district by districtSoato (code)
    const district = await prisma.district.findUnique({
      where: { code: String(props.districtSoato) },
    });

    if (!district) {
      console.warn(
        `⚠️  District not found for street: ${props.name} (districtSoato: ${props.districtSoato})`
      );
      skipCount++;
      continue;
    }

    // Skip if streetId (code) is null
    if (!props.streetId) {
      console.warn(
        `⚠️  Skipping street without streetId: ${props.name}`
      );
      skipCount++;
      continue;
    }

    const geometry = convertGeometry(feature.geometry);
    
    // Validate geometry has valid coordinates
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      console.warn(`⚠️  Invalid geometry for street: ${props.name}`);
      invalidCoordCount++;
      skipCount++;
      continue;
    }

    // For LineString, check if coords are in valid range (Uzbekistan bounds)
    if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates[0])) {
      const [lng, lat] = geometry.coordinates[0];
      if (lng < 50 || lng > 75 || lat < 35 || lat > 50) {
        console.warn(
          `⚠️  Coordinates out of Uzbekistan bounds for ${props.name}: [${lng}, ${lat}]`
        );
        invalidCoordCount++;
        skipCount++;
        continue;
      }
    }

    let center: any = null;
    try {
      const c = centroid(geometry);
      center = c.geometry;
    } catch (error) {
      console.warn(`⚠️  Could not calculate center for: ${props.name}`);
      center = null;
    }

    try {
      await prisma.street.upsert({
        where: { code: String(props.streetId) },
        update: {
          nameUz: props.name || 'Unknown',
          nameRu: props.ruName || null,
          geometry,
          center,
          childName: props.childName || null,
          streetStatus: props.kochaxolati || null,
          plaque: props.peshtaxta || null,
          streetId: props.streetId ? String(props.streetId) : null,
          streetCoordinatesId: props.streetCoordinatesId ? String(props.streetCoordinatesId) : null,
          districtId: district.id,
        },
        create: {
          nameUz: props.name || 'Unknown',
          nameRu: props.ruName || null,
          code: String(props.streetId),
          districtId: district.id,
          geometry,
          center,
          childName: props.childName || null,
          streetStatus: props.kochaxolati || null,
          plaque: props.peshtaxta || null,
          streetId: props.streetId ? String(props.streetId) : null,
          streetCoordinatesId: props.streetCoordinatesId ? String(props.streetCoordinatesId) : null,
        },
      });

      successCount++;
      console.log(
        `✓ Inserted street: ${props.name} (District: ${district.nameUz})`
      );
    } catch (error) {
      console.error(`❌ Error inserting street ${props.name}:`, error);
      skipCount++;
    }
  }

  console.log('\n========================================');
  console.log(`✅ Successfully inserted: ${successCount} streets`);
  console.log(`⚠️  Invalid coordinates: ${invalidCoordCount} streets`);
  console.log(`⚠️  Skipped: ${skipCount} streets`);
  console.log('========================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Street seed completed.');
  })
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });