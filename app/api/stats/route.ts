import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [regions, districts, mahallas, streets] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.mahalla.count(),
      prisma.street.count(),
    ]);

    return NextResponse.json({
      regions,
      districts,
      mahallas,
      streets,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
