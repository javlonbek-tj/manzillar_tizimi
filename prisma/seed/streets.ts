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
  const filePath = path.join(
    process.cwd(),
    'prisma',
    'data',
    'Sirdaryo_vil_street.geojson'
  );

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
      where: { code: String(props.Tuman_shahar_soato_kodi) },
    });

    if (!district) {
      console.warn(
        `⚠️  District not found for street: ${props.Kocha_nomi} (Tuman_shahar_soato_kodi: ${props.Tuman_shahar_soato_kodi})`
      );
      skipCount++;
      continue;
    }

    // Skip if streetId (code) is null
    if (!props.Kocha_ID) {
      console.warn(`⚠️  Skipping street without Kocha_ID: ${props.Kocha_nomi}`);
      skipCount++;
      continue;
    }

    const geometry = convertGeometry(feature.geometry);

    // Validate geometry has valid coordinates
    if (
      !geometry ||
      !geometry.coordinates ||
      geometry.coordinates.length === 0
    ) {
      console.warn(`⚠️  Invalid geometry for street: ${props.Kocha_nomi}`);
      invalidCoordCount++;
      skipCount++;
      continue;
    }

    // For LineString, check if coords are in valid range (Uzbekistan bounds)
    if (
      geometry.type === 'LineString' &&
      Array.isArray(geometry.coordinates[0])
    ) {
      const [lng, lat] = geometry.coordinates[0];
      if (lng < 50 || lng > 75 || lat < 35 || lat > 50) {
        console.warn(
          `⚠️  Coordinates out of Uzbekistan bounds for ${props.Kocha_nomi}: [${lng}, ${lat}]`
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
      console.warn(`⚠️  Could not calculate center for: ${props.Kocha_nomi}`);
      center = null;
    }

    try {
      await prisma.street.upsert({
        where: { code: String(props.Kocha_ID) },

        update: {
          nameUz: props.Kocha_nomi || 'Unknown',
          nameRu: null,
          geometry,
          center,
          code: String(props.Kocha_ID),
          districtId: district.id,
          type: props.Kocha_turi,
          oldNameId: props.Kochaning_avvalgi_ID || null,
          oldName: props.Kochaning_avvalgi_nomi || null,
          mahallaId: String(props.Mahalla_soato_kodi_1),
        },

        create: {
          nameUz: props.Kocha_nomi || 'Unknown',
          nameRu: null,
          geometry,
          center,
          code: String(props.Kocha_ID),
          districtId: district.id,
          type: props.Kocha_turi,
          oldNameId: props.Kochaning_avvalgi_ID || null,
          oldName: props.Kochaning_avvalgi_nomi || null,
          mahallaId: String(props.Mahalla_soato_kodi_1),
        },
      });

      successCount++;
      console.log(
        `✓ Inserted street: ${props.Kocha_nomi} (District: ${district.nameUz})`
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
