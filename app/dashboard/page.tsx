import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';

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
        region: { select: { nameUz: true } },
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
        district: {
          select: {
            nameUz: true,
            regionId: true,
            region: { select: { nameUz: true } },
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
        type: true,
        oldName: true,
        mahalla: {
          select: { nameUz: true },
        },
        district: {
          select: {
            nameUz: true,
            regionId: true,
            region: { select: { nameUz: true } },
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

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardWrapper initialData={data} />
    </Suspense>
  );
}
