import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const districtId = searchParams.get('districtId');
    const mahallaId = searchParams.get('mahallaId');
    const streetId = searchParams.get('streetId');

    const where: any = {};
    if (regionId) where.regionId = regionId;
    if (districtId) where.districtId = districtId;
    if (mahallaId) where.mahallaId = mahallaId;
    if (streetId) where.streetId = streetId;

    const addresses = await prisma.address.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      regionId,
      regionName,
      districtId,
      districtName,
      mahallaId,
      mahallaName,
      streetId,
      streetName,
      houseNumber,
      description,
      latitude,
      longitude,
      geometry,
      center,
    } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const address = await prisma.address.create({
      data: {
        regionId: regionId || null,
        regionName: regionName || null,
        districtId: districtId || null,
        districtName: districtName || null,
        mahallaId: mahallaId || null,
        mahallaName: mahallaName || null,
        streetId: streetId || null,
        streetName: streetName || null,
        houseNumber: houseNumber || null,
        description: description || null,
        latitude,
        longitude,
        geometry: geometry || null,
        center: center || null,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
