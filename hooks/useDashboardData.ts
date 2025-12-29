import { useMemo } from 'react';
import type { DashboardData, TabType, DashboardItem } from '@/types/dashboard';

export function useDashboardData(
  data: DashboardData,
  activeTab: TabType,
  searchTerm: string,
  selectedRegion: string,
  selectedDistrict: string
) {
  const filteredData = useMemo(() => {
    let filtered: DashboardItem[] = [];

    switch (activeTab) {
      case 'regions':
        filtered = data.regions;
        break;
      case 'districts':
        filtered = selectedRegion
          ? data.districts.filter((d) => d.regionId === selectedRegion)
          : data.districts;
        break;
      case 'mahallas':
        filtered = data.mahallas;
        if (selectedRegion) {
          filtered = filtered.filter(
            (m) => m.district.regionId === selectedRegion
          );
        }
        if (selectedDistrict) {
          filtered = filtered.filter((m) => m.districtId === selectedDistrict);
        }
        break;
      case 'streets':
        filtered = data.streets;
        if (selectedRegion) {
          filtered = filtered.filter(
            (s) => s.district.regionId === selectedRegion
          );
        }
        if (selectedDistrict) {
          filtered = filtered.filter((s) => s.districtId === selectedDistrict);
        }
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.nameUz.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.nameRu &&
            item.nameRu.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [data, activeTab, searchTerm, selectedRegion, selectedDistrict]);

  const availableDistricts = useMemo(() => {
    if (!selectedRegion) return [];
    return data.districts.filter((d) => d.regionId === selectedRegion);
  }, [selectedRegion, data.districts]);

  return {
    filteredData,
    availableDistricts,
  };
}

