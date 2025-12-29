import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const regionId = searchParams.get('regionId');

    if (districtId) {
      const mahallas = await prisma.mahalla.findMany({
        where: {
          districtId: districtId,
        },
        select: {
          id: true,
          nameUz: true,
          nameRu: true,
          code: true,
          geometry: true,
          center: true,
          uzKadName: true,
          geoCode: true,
          oneId: true,
          hidden: true,
          mergedIntoId: true,
          mergedIntoName: true,
          districtId: true,
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
        },
      });
      return NextResponse.json(mahallas);
    } else if (regionId) {
      // Get all mahallas for districts in a region
      const mahallas = await prisma.mahalla.findMany({
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
          geometry: true,
          center: true,
          uzKadName: true,
          geoCode: true,
          oneId: true,
          hidden: true,
          mergedIntoId: true,
          mergedIntoName: true,
          districtId: true,
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
        },
      });
      return NextResponse.json(mahallas);
    }

    return NextResponse.json(
      { error: 'districtId or regionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching mahallas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mahallas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nameUz,
      nameRu,
      code,
      districtId,
      uzKadName,
      geoCode,
      oneId,
      hidden,
      mergedIntoId,
      mergedIntoName,
    } = body;

    if (!nameUz || !code || !districtId) {
      return NextResponse.json(
        { error: 'nameUz, code, and districtId are required' },
        { status: 400 }
      );
    }

    const mahalla = await prisma.mahalla.create({
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        districtId,
        uzKadName: uzKadName || null,
        geoCode: geoCode || null,
        oneId: oneId || null,
        hidden: hidden || false,
        mergedIntoId: mergedIntoId || null,
        mergedIntoName: mergedIntoName || null,
        geometry: { type: 'Polygon', coordinates: [] },
      },
    });

    return NextResponse.json(mahalla, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mahalla:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create mahalla' },
      { status: 500 }
    );
  }
}
