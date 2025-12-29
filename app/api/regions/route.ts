import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        geometry: true,
        center: true,
        _count: {
          select: {
            districts: true,
          },
        },
      },
      orderBy: {
        nameUz: 'asc',
      },
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nameUz, nameRu, code } = body;

    if (!nameUz || !code) {
      return NextResponse.json(
        { error: 'nameUz and code are required' },
        { status: 400 }
      );
    }

    const region = await prisma.region.create({
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        geometry: { type: 'Polygon', coordinates: [] },
      },
    });

    return NextResponse.json(region, { status: 201 });
  } catch (error: any) {
    console.error('Error creating region:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create region' },
      { status: 500 }
    );
  }
}