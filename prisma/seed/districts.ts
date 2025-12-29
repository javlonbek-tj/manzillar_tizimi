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
    'districts.geojson'
  );

  if (!fs.existsSync(filePath)) {
    console.error('Districts GeoJSON not found at:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(raw);

  for (const feature of geojson.features) {
    const props = feature.properties;

    // Find the parent region by code
    const region = await prisma.region.findUnique({
      where: { code: props.regionId },
    });
    if (!region) {
      console.warn(
        'Region not found for district:',
        props.nameUz,
        props.regionId
      );
      continue;
    }

    const geometry = convertGeometry(feature.geometry);

    let center: any = null;
    try {
      const c = centroid(geometry);
      center = c.geometry;
    } catch (_) {
      center = null;
    }

    await prisma.district.upsert({
      where: { code: String(props.code) },
      update: {},
      create: {
        nameUz: props.nameUz,
        nameRu: props.nameRu || null,
        code: String(props.code),
        regionId: region.id,
        geometry,
        center,
      },
    });

    console.log(
      `Inserted district: ${props.nameUz} (Region: ${region.nameUz})`
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ District seed completed.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
