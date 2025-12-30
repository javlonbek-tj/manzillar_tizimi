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
  realEstate: number;
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
    realEstate: 0,
  });
  const [loading, setLoading] = useState(true);

  const updateDynamicStats = useCallback(async () => {
    try {
      setLoading(true);
      if (selectedDistrict) {
        // Load stats for this district
        const statsData = await fetchStats(undefined, selectedDistrict.id);
        
        setStats({
          regions: 1,
          districts: 1,
          mahallas: statsData.mahallas || mahallas.length, // Fallback to current mahallas length if needed
          streets: statsData.streets || 0,
          realEstate: statsData.realEstate || 0,
        });
      } else if (selectedRegion) {
        // Load stats for this region
        const statsData = await fetchStats(selectedRegion.id);
        const districtsCount = districts.length;

        setStats({
          regions: 1,
          districts: districtsCount,
          mahallas: statsData.mahallas || 0,
          streets: statsData.streets || 0,
          realEstate: statsData.realEstate || 0,
        });
      } else {
        // Load global stats
        const statsData = await fetchStats();
        setStats({
          regions: statsData.regions || 0,
          districts: statsData.districts || 0,
          mahallas: statsData.mahallas || 0,
          streets: statsData.streets || 0,
          realEstate: statsData.realEstate || 0,
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
