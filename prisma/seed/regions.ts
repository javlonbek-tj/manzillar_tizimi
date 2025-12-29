import fs from 'fs';
import path from 'path';
import proj4 from 'proj4';
import centroid from '@turf/centroid';
import prisma from '@/lib/prisma';

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
  // add more types if needed
  return geometry;
}

async function main() {
  const filePath = path.join(
    process.cwd(),
    'prisma',
    'data',
    'regions.geojson'
  );

  if (!fs.existsSync(filePath)) {
    console.error('GeoJSON file not found at:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(raw);

  const features = geojson.features;

  for (const feature of features) {
    const props = feature.properties;
    const geometry = convertGeometry(feature.geometry);

    let center: any = null;
    try {
      const c = centroid(geometry);
      center = c.geometry;
    } catch (_) {
      center = null;
    }

    await prisma.region.upsert({
      where: { code: props.code },
      update: {},
      create: {
        nameUz: props.nameUz,
        nameRu: props.nameRu || null,
        code: props.code,
        geometry: geometry,
        center: center,
      },
    });

    console.log(`Inserted region: ${props.nameUz}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Seed completed.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
