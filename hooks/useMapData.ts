import { useState, useEffect, useCallback } from 'react';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';
import { fetchRegions, fetchDistricts, fetchMahallas } from '@/services/api';

export function useMapData() {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [mahallas, setMahallas] = useState<MahallaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMahallas, setLoadingMahallas] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const regionsData = await fetchRegions();
      setRegions(regionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLoading(false);
    }
  }, []);

  const loadDistricts = useCallback(async (regionId: string) => {
    try {
      setLoadingDistricts(true);
      const districtsData = await fetchDistricts(regionId);
      setDistricts(districtsData);
      setMahallas([]);
      setLoadingDistricts(false);
      return districtsData;
    } catch (error) {
      console.error('Error loading districts:', error);
      setLoadingDistricts(false);
      return [];
    }
  }, []);

  const loadMahallas = useCallback(async (districtId: string) => {
    try {
      setLoadingMahallas(true);
      const mahallasData = await fetchMahallas(districtId);
      setMahallas(mahallasData);
      setLoadingMahallas(false);
      return mahallasData;
    } catch (error) {
      console.error('Error loading mahallas:', error);
      setLoadingMahallas(false);
      return [];
    }
  }, []);

  const resetData = useCallback(() => {
    setDistricts([]);
    setMahallas([]);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    regions,
    districts,
    mahallas,
    loading,
    loadingDistricts,
    loadingMahallas,
    loadDistricts,
    loadMahallas,
    resetData,
  };
}
