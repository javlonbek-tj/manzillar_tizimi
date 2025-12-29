import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');

    const where = regionId ? { regionId } : {};

    const districts = await prisma.district.findMany({
      where,
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        geometry: true,
        center: true,
        regionId: true,
        region: {
          select: {
            nameUz: true,
          },
        },
        _count: {
          select: {
            mahallas: true,
          },
        },
      },
      orderBy: {
        nameUz: 'asc',
      },
    });

    return NextResponse.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameUz, nameRu, code, regionId } = body;

    if (!nameUz || !code || !regionId) {
      return NextResponse.json(
        { error: 'nameUz, code, and regionId are required' },
        { status: 400 }
      );
    }

    const district = await prisma.district.create({
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        regionId,
        geometry: { type: 'Polygon', coordinates: [] },
      },
    });

    return NextResponse.json(district, { status: 201 });
  } catch (error: any) {
    console.error('Error creating district:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create district' },
      { status: 500 }
    );
  }
}