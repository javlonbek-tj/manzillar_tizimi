import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const regionId = searchParams.get('regionId');

    if (districtId) {
      // Get streets for a specific district
      const streets = await prisma.street.findMany({
        where: {
          districtId: districtId,
        },
        select: {
          id: true,
          nameUz: true,
          nameRu: true,
          code: true,
          type: true,
          oldName: true,
          districtId: true,
          mahallaId: true,
          geometry: true,
          center: true,
          district: {
            select: {
              nameUz: true,
              regionId: true,
              region: {
                select: {
                  nameUz: true,
                },
              },
            },
          },
          mahalla: {
            select: {
              nameUz: true,
            },
          },
        },
      });
      return NextResponse.json(streets);
    } else if (regionId) {
      // Get all streets for districts in a region
      const streets = await prisma.street.findMany({
        where: {
          district: {
            regionId: regionId,
          },
        },
        select: {
          id: true,
          nameUz: true,
          nameRu: true,
          code: true,
          type: true,
          oldName: true,
          districtId: true,
          mahallaId: true,
          geometry: true,
          center: true,
          district: {
            select: {
              nameUz: true,
              regionId: true,
              region: {
                select: {
                  nameUz: true,
                },
              },
            },
          },
          mahalla: {
            select: {
              nameUz: true,
            },
          },
        },
      });
      return NextResponse.json(streets);
    }

    return NextResponse.json(
      { error: 'districtId or regionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching streets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameUz, nameRu, code, districtId } = body;

    if (!nameUz || !code || !districtId) {
      return NextResponse.json(
        { error: 'nameUz, code, and districtId are required' },
        { status: 400 }
      );
    }

    const street = await prisma.street.create({
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        districtId,
        geometry: { type: 'LineString', coordinates: [] },
      },
    });

    return NextResponse.json(street, { status: 201 });
  } catch (error: any) {
    console.error('Error creating street:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create street' },
      { status: 500 }
    );
  }
}
