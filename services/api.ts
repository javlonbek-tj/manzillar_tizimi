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
export const fetchStats = () =>
  fetch('/api/stats').then((res) => res.json()) as Promise<{
    regions: number;
    districts: number;
    mahallas: number;
    streets: number;
  }>;
export const fetchStreetsByDistrict = (districtId: string) =>
  fetch(`/api/streets?districtId=${districtId}`).then((res) => res.json());
export const fetchStreetsByRegion = (regionId: string) =>
  fetch(`/api/streets?regionId=${regionId}`).then((res) => res.json());
