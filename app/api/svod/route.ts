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

    // For each region and district, get counts
    const svodData = await Promise.all(
      regions.map(async (region) => {
        // Get region-level stats
        const [regionMahallaCount, regionStreetCount, regionRealEstateCount] =
          await Promise.all([
            prisma.mahalla.count({
              where: {
                district: {
                  regionId: region.id,
                },
              },
            }),
            prisma.street.count({
              where: {
                district: {
                  regionId: region.id,
                },
              },
            }),
            prisma.realEState.count({
              where: {
                district: {
                  regionId: region.id,
                },
              },
            }),
          ]);

        // Get district-level stats
        const districts = await Promise.all(
          region.districts.map(async (district) => {
            const [mahallaCount, streetCount, realEstateCount] =
              await Promise.all([
                prisma.mahalla.count({
                  where: { districtId: district.id },
                }),
                prisma.street.count({
                  where: { districtId: district.id },
                }),
                prisma.realEState.count({
                  where: { districtId: district.id },
                }),
              ]);

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
          })
        );

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
      })
    );

    return NextResponse.json({ regions: svodData });
  } catch (error) {
    console.error('Error fetching SVOD data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SVOD data' },
      { status: 500 }
    );
  }
}
