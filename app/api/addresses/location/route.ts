import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Simple point-in-polygon check using ray casting algorithm
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

function checkPointInGeometry(pointCoords: [number, number], geometry: any): boolean {
  if (!geometry || !geometry.coordinates) return false;
  
  const [lng, lat] = pointCoords;
  const pointToCheck: [number, number] = [lng, lat];
  
  try {
    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0]; // First ring (exterior)
      return pointInPolygon(pointToCheck, coordinates);
    }
    
    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some((polygon: number[][][]) => 
        pointInPolygon(pointToCheck, polygon[0])
      );
    }
  } catch (error) {
    console.error('Error checking point in geometry:', error);
    return false;
  }
  
  return false;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'lat and lng are required' },
        { status: 400 }
      );
    }

    const point: [number, number] = [lng, lat];
    const result: {
      region?: { id: string; nameUz: string };
      district?: { id: string; nameUz: string };
      mahalla?: { id: string; nameUz: string; code: string };
      street?: { id: string; nameUz: string };
    } = {};

    // Check streets first (most specific)
    const streets = await prisma.street.findMany({
      select: {
        id: true,
        nameUz: true,
        geometry: true,
      },
    });

    for (const street of streets) {
      if (checkPointInGeometry(point, street.geometry as any)) {
        result.street = { id: street.id, nameUz: street.nameUz };
        break;
      }
    }

    // Check mahallas
    const mahallas = await prisma.mahalla.findMany({
      select: {
        id: true,
        nameUz: true,
        code: true,
        geometry: true,
      },
    });

    for (const mahalla of mahallas) {
      if (checkPointInGeometry(point, mahalla.geometry as any)) {
        result.mahalla = { id: mahalla.id, nameUz: mahalla.nameUz, code: mahalla.code };
        break;
      }
    }

    // Check districts
    const districts = await prisma.district.findMany({
      select: {
        id: true,
        nameUz: true,
        geometry: true,
      },
    });

    for (const district of districts) {
      if (checkPointInGeometry(point, district.geometry as any)) {
        result.district = { id: district.id, nameUz: district.nameUz };
        break;
      }
    }

    // Check regions
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        nameUz: true,
        geometry: true,
      },
    });

    for (const region of regions) {
      if (checkPointInGeometry(point, region.geometry as any)) {
        result.region = { id: region.id, nameUz: region.nameUz };
        break;
      }
    }

    // If we found a mahalla, get its district and region
    if (result.mahalla && !result.district) {
      const mahallaFull = await prisma.mahalla.findUnique({
        where: { id: result.mahalla.id },
        select: {
          code: true,
          district: {
            select: {
              id: true,
              nameUz: true,
              region: {
                select: {
                  id: true,
                  nameUz: true,
                },
              },
            },
          },
        },
      });

      if (mahallaFull?.district) {
        result.district = {
          id: mahallaFull.district.id,
          nameUz: mahallaFull.district.nameUz,
        };
        if (mahallaFull.district.region) {
          result.region = {
            id: mahallaFull.district.region.id,
            nameUz: mahallaFull.district.region.nameUz,
          };
        }
      }
    }

    // If we found a street, get its mahalla, district, and region
    if (result.street && !result.mahalla) {
      const streetFull = await prisma.street.findUnique({
        where: { id: result.street.id },
        select: {
          mahalla: {
            select: {
              id: true,
              nameUz: true,
              code: true,
              district: {
                select: {
                  id: true,
                  nameUz: true,
                  region: {
                    select: {
                      id: true,
                      nameUz: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (streetFull?.mahalla) {
        result.mahalla = {
          id: streetFull.mahalla.id,
          nameUz: streetFull.mahalla.nameUz,
          code: streetFull.mahalla.code,
        };
        if (streetFull.mahalla.district) {
          result.district = {
            id: streetFull.mahalla.district.id,
            nameUz: streetFull.mahalla.district.nameUz,
          };
          if (streetFull.mahalla.district.region) {
            result.region = {
              id: streetFull.mahalla.district.region.id,
              nameUz: streetFull.mahalla.district.region.nameUz,
            };
          }
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error finding location:', error);
    return NextResponse.json(
      { error: 'Failed to find location' },
      { status: 500 }
    );
  }
}
