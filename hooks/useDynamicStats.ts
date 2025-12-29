import { useState, useEffect, useCallback } from 'react';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';
import {
  fetchStats,
  fetchStreetsByDistrict,
  fetchStreetsByRegion,
} from '@/services/api';

interface Stats {
  regions: number;
  districts: number;
  mahallas: number;
  streets: number;
}

export function useDynamicStats(
  selectedRegion: RegionData | null,
  selectedDistrict: DistrictData | null,
  districts: DistrictData[],
  mahallas: MahallaData[]
) {
  const [stats, setStats] = useState<Stats>({
    regions: 0,
    districts: 0,
    mahallas: 0,
    streets: 0,
  });
  const [loading, setLoading] = useState(true);

  const updateDynamicStats = useCallback(async () => {
    try {
      setLoading(true);
      if (selectedDistrict) {
        // Get mahallas count for this district
        const mahallasCount = mahallas.length;

        // Get streets count for this district
        const streetsData = await fetchStreetsByDistrict(selectedDistrict.id);

        setStats({
          regions: 1,
          districts: 1,
          mahallas: mahallasCount,
          streets: Array.isArray(streetsData) ? streetsData.length : 0,
        });
      } else if (selectedRegion) {
        // Get districts count for this region
        const districtsCount = districts.length;

        // Get total mahallas for this region
        const mahallasResponse = await fetch(
          '/api/mahallas?regionId=' + selectedRegion.id
        );
        const mahallasData = await mahallasResponse.json();

        // Get total streets for this region
        const streetsData = await fetchStreetsByRegion(selectedRegion.id);

        setStats({
          regions: 1,
          districts: districtsCount,
          mahallas: Array.isArray(mahallasData) ? mahallasData.length : 0,
          streets: Array.isArray(streetsData) ? streetsData.length : 0,
        });
      } else {
        // Load global stats
        const statsData = await fetchStats();
        setStats({
          regions: statsData.regions || 0,
          districts: statsData.districts || 0,
          mahallas: statsData.mahallas || 0,
          streets: statsData.streets || 0,
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedDistrict, mahallas, districts]);

  useEffect(() => {
    updateDynamicStats();
  }, [updateDynamicStats]);

  return { stats, loading };
}
