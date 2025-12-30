import fs from 'fs';
import path from 'path';
import proj4 from 'proj4';
import centroid from '@turf/centroid';
import prisma from '@/lib/prisma';

// EPSG:3857 → EPSG:4326
const mercator = 'EPSG:3857';
const wgs84 = 'EPSG:4326';

function convertPolygon(polygon: number[][][]): number[][][] {
  return polygon.map((ring) =>
    ring.map(([x, y]) => {
      const [lng, lat] = proj4(mercator, wgs84, [x, y]);
      return [lng, lat];
    })
  );
}

function convertGeometry(geometry: any): any {
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: convertPolygon(geometry.coordinates),
    };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(convertPolygon),
    };
  }
  return geometry;
}

async function main() {
  const filePath = path.join(
    process.cwd(),
    'prisma',
    'data',
    'Sirdaryo_vil_dkyat.geojson'
  );

  if (!fs.existsSync(filePath)) {
    console.error('RealEstate GeoJSON not found at:', filePath);
    process.exit(1);
  }

  // Read file bit by bit or just read the whole thing if it fits in memory.
  // Given the file size (185MB), we might want to be careful, but fs.readFileSync usually handles this ok in Node unless memory is very tight.
  // For robustness, standard read is fine for now.
  const raw = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(raw);

  console.log(`Found ${geojson.features.length} features.`);

  let count = 0;
  for (const feature of geojson.features) {
    const props = feature.properties;
    
    const geometry = convertGeometry(feature.geometry);
    
    let center: any = null;
    try {
      const c = centroid(geometry);
      center = c.geometry;
    } catch (_) {
      center = null;
    }

    try {
      await prisma.realEState.create({
        data: {
          owner: props.SUBYEKT,
          type: props.NOMI,
          address: props.MANZIL,
          districtName: props.TUMAN,
          streetName: props.KOCHA,
          houseNumber: String(props.UY_RAQAM),
          ownership: props.HUQUQ,
          ownershipType: props.HUJJAT,
          ownershipNumber: String(props.HUJ_RAQAM),
          ownershipDate: String(props.HUJ_SANA),
          cadastralValue: props.KAD_BAHO ? String(props.KAD_BAHO) : null,
          cadastralNumber: String(props.KADASTR),
          mahalla: props.MAHALLA,
          areaInDoc: props.HUJ_MAYDON ? String(props.HUJ_MAYDON) : null,
          areaReal: props.HAQ_MAYDON ? String(props.HAQ_MAYDON) : null,
          geometry,
          center,
        },
      });
      count++;
      if (count % 100 === 0) {
        console.log(`Inserted ${count} records...`);
      }
    } catch (e) {
      console.error(`Error inserting record ${props.KADASTR}:`, e);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ RealEstate seed completed.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
