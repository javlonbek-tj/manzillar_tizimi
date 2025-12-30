import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const regionId = searchParams.get('regionId');
    const mahalla = searchParams.get('mahalla');

    if (mahalla) {
       const dbRealEstates = await prisma.realEState.findMany({
        where: {
          mahalla: {
            contains: mahalla,
            mode: 'insensitive',
          }
        },
        select: {
          id: true,
          owner: true,
          address: true,
          type: true,
          districtName: true,
          streetName: true,
          houseNumber: true,
          cadastralNumber: true,
          mahalla: true,
          geometry: true,
          center: true,
        },
      });
      return NextResponse.json(dbRealEstates);
    } else if (districtId) {
      const dbRealEstates = await prisma.realEState.findMany({
        where: {
          districtId: districtId,
        },
        select: {
          id: true,
          owner: true,
          address: true,
          type: true,
          districtName: true,
          streetName: true,
          houseNumber: true,
          cadastralNumber: true,
          mahalla: true,
          geometry: true,
          center: true,
        },
      });
      return NextResponse.json(dbRealEstates);
    } else if (regionId) {
      const dbRealEstates = await prisma.realEState.findMany({
        where: {
          district: {
            regionId: regionId,
          },
        },
        select: {
          id: true,
          owner: true,
          address: true,
          type: true,
          districtName: true,
          streetName: true,
          houseNumber: true,
          cadastralNumber: true,
          mahalla: true,
          geometry: true,
          center: true,
        },
      });
      return NextResponse.json(dbRealEstates);
    }

    return NextResponse.json(
      { error: 'districtId or regionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching real estates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real estates' },
      { status: 500 }
    );
  }
}
