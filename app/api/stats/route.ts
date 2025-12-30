import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const districtId = searchParams.get('districtId');

    let streetWhere = {};
    let realEstateWhere = {};
    let mahallaWhere = {};

    if (districtId) {
      streetWhere = { districtId };
      realEstateWhere = { districtId };
      mahallaWhere = { districtId };
    } else if (regionId) {
      streetWhere = { district: { regionId } };
      realEstateWhere = { district: { regionId } };
      mahallaWhere = { district: { regionId } };
    }

    const [regions, districts, mahallas, streets, realEstate] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(regionId ? { where: { regionId } } : undefined),
      prisma.mahalla.count({ where: mahallaWhere }),
      prisma.street.count({ where: streetWhere }),
      prisma.realEState.count({ where: realEstateWhere }),
    ]);

    return NextResponse.json({
      regions,
      districts,
      mahallas,
      streets,
      realEstate,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
