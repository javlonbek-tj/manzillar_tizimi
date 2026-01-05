import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all regions with their districts
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        nameUz: true,
        code: true,
        districts: {
          select: {
            id: true,
            nameUz: true,
            code: true,
          },
          orderBy: {
            nameUz: 'asc',
          },
        },
      },
      orderBy: {
        nameUz: 'asc',
      },
    });

    // Fetch all counts in parallel using groupBy for better performance
    const [mahallaCountsByDistrict, streetCountsByDistrict, realEstateCountsByDistrict] =
      await Promise.all([
        // Group mahalla counts by district
        prisma.mahalla.groupBy({
          by: ['districtId'],
          _count: {
            id: true,
          },
        }),
        // Group street counts by district
        prisma.street.groupBy({
          by: ['districtId'],
          _count: {
            id: true,
          },
        }),
        // Group real estate counts by district
        prisma.realEState.groupBy({
          by: ['districtId'],
          _count: {
            id: true,
          },
          where: {
            districtId: {
              not: null,
            },
          },
        }),
      ]);

    // Create lookup maps for O(1) access
    const mahallaCountMap = new Map(
      mahallaCountsByDistrict.map((item) => [item.districtId, item._count.id])
    );
    const streetCountMap = new Map(
      streetCountsByDistrict.map((item) => [item.districtId, item._count.id])
    );
    const realEstateCountMap = new Map(
      realEstateCountsByDistrict.map((item) => [item.districtId!, item._count.id])
    );

    // Build the response data structure
    const svodData = regions.map((region) => {
      // Calculate region-level stats by summing district counts
      let regionMahallaCount = 0;
      let regionStreetCount = 0;
      let regionRealEstateCount = 0;

      const districts = region.districts.map((district) => {
        const mahallaCount = mahallaCountMap.get(district.id) || 0;
        const streetCount = streetCountMap.get(district.id) || 0;
        const realEstateCount = realEstateCountMap.get(district.id) || 0;

        // Add to region totals
        regionMahallaCount += mahallaCount;
        regionStreetCount += streetCount;
        regionRealEstateCount += realEstateCount;

        return {
          id: district.id,
          nameUz: district.nameUz,
          code: district.code,
          stats: {
            mahallaCount,
            streetCount,
            realEstateCount,
          },
        };
      });

      return {
        id: region.id,
        nameUz: region.nameUz,
        code: region.code,
        stats: {
          mahallaCount: regionMahallaCount,
          streetCount: regionStreetCount,
          realEstateCount: regionRealEstateCount,
        },
        districts,
      };
    });

    return NextResponse.json({ regions: svodData });
  } catch (error) {
    console.error('Error fetching SVOD data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SVOD data' },
      { status: 500 }
    );
  }
}

