import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { LoadingSpinner } from '@/components/shared';

async function getDashboardData() {
  const [regions, districts, mahallas, streets, addresses] = await Promise.all([
    prisma.region.findMany({
      select: { id: true, nameUz: true, nameRu: true, code: true },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.district.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        regionId: true,
        region: { select: { nameUz: true, code: true } },
      },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.mahalla.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        uzKadName: true,
        geoCode: true,
        oneId: true,
        districtId: true,
        hidden: true,
        mergedIntoId: true,
        mergedIntoName: true,
        district: {
          select: {
            nameUz: true,
            code: true,
            regionId: true,
            region: { select: { nameUz: true, code: true } },
          },
        },
      },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.street.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        districtId: true,
        mahallaId: true,
        type: true,
        oldName: true,
        mahalla: {
          select: { nameUz: true },
        },
        district: {
          select: {
            nameUz: true,
            code: true,
            regionId: true,
            region: { select: { nameUz: true, code: true } },
          },
        },
      },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.address.findMany({
      select: {
        id: true,
        regionId: true,
        regionName: true,
        districtId: true,
        districtName: true,
        mahallaId: true,
        mahallaName: true,
        streetId: true,
        streetName: true,
        houseNumber: true,
        description: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { regions, districts, mahallas, streets, addresses };
}

async function DashboardDataFetcher() {
  const data = await getDashboardData();
  return <DashboardContent initialData={data} />;
}

export default function DashboardPage() {
  return (
    <DashboardWrapper>
      <Suspense fallback={<LoadingSpinner fullPage={false} />}>
        <DashboardDataFetcher />
      </Suspense>
    </DashboardWrapper>
  );
}
