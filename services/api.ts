// src/services/api.ts
import type {
  RegionData,
  DistrictData,
  MahallaData,
  DashboardStats,
} from '@/types/map';

export const fetchRegions = () =>
  fetch('/api/regions').then((res) => res.json()) as Promise<RegionData[]>;
export const fetchDistricts = (regionId: string) =>
  fetch(`/api/districts?regionId=${regionId}`).then((res) =>
    res.json()
  ) as Promise<DistrictData[]>;
export const fetchMahallas = (districtId: string) =>
  fetch(`/api/mahallas?districtId=${districtId}`).then((res) =>
    res.json()
  ) as Promise<MahallaData[]>;
export const fetchStats = (regionId?: string, districtId?: string) => {
  const params = new URLSearchParams();
  if (regionId) params.append('regionId', regionId);
  if (districtId) params.append('districtId', districtId);
  return fetch(`/api/stats?${params.toString()}`).then((res) => res.json()) as Promise<{
    regions: number;
    districts: number;
    mahallas: number;
    streets: number;
    realEstate: number;
  }>;
};
export const fetchStreetsByDistrict = (districtId: string) =>
  fetch(`/api/streets?districtId=${districtId}`).then((res) => res.json());
export const fetchStreetsByRegion = (regionId: string) =>
  fetch(`/api/streets?regionId=${regionId}`).then((res) => res.json());

export const fetchRealEstateByRegion = (regionId: string) =>
  fetch(`/api/real-estate?regionId=${regionId}`).then((res) => res.json());



export const fetchRealEstateByDistrict = (districtId: string) =>
  fetch(`/api/real-estate?districtId=${districtId}`).then((res) => res.json());

export const fetchRealEstateByMahalla = (mahallaName: string) =>
  fetch(`/api/real-estate?mahalla=${encodeURIComponent(mahallaName)}`).then(
    (res) => res.json()
  );

export const fetchSvodData = () =>
  fetch('/api/svod').then((res) => res.json());
