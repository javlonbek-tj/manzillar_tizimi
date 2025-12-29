import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { SearchInput } from './SearchInput';
import { SelectionInfo } from './SelectionInfo';
import { SidebarList } from './SidebarList';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';

type SidebarLevel = 'regions' | 'districts' | 'mahallas';

interface SidebarProps {
  level: SidebarLevel;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  regions: RegionData[];
  districts: DistrictData[];
  mahallas: MahallaData[];
  selectedRegion: RegionData | null;
  selectedDistrict: DistrictData | null;
  selectedMahalla: MahallaData | null;
  loading?: boolean;
  loadingDistricts?: boolean;
  loadingMahallas?: boolean;
  onRegionClick: (region: RegionData) => void;
  onDistrictClick: (district: DistrictData) => void;
  onMahallaClick: (mahalla: MahallaData) => void;
  onBack?: () => void;
}

export function Sidebar({
  level,
  searchTerm,
  onSearchChange,
  regions,
  districts,
  mahallas,
  selectedRegion,
  selectedDistrict,
  selectedMahalla,
  loading = false,
  loadingDistricts = false,
  loadingMahallas = false,
  onRegionClick,
  onDistrictClick,
  onMahallaClick,
  onBack,
}: SidebarProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* Sidebar */}
      <div
          className={cn(
            'w-80 transition-all duration-300 overflow-hidden z-1000 flex flex-col h-full',
            theme === 'dark' ? 'border-r border-gray-700' : 'border-r border-gray-200',
            theme === 'dark'
              ? 'bg-gray-800'
              : 'bg-white'
        )}
      >
        <div
          className={cn(
            'flex justify-between items-center p-4 border-b',
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          )}
        >
          <h3
            className={cn(
              'font-bold text-lg',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            Filtr
          </h3>
        </div>

        <SearchInput value={searchTerm} onChange={onSearchChange} />

        <SelectionInfo
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
          selectedMahalla={selectedMahalla}
          onBack={onBack}
        />

        <SidebarList
          level={level}
          regions={regions}
          districts={districts}
          mahallas={mahallas}
          searchTerm={searchTerm}
          selectedMahalla={selectedMahalla}
          loading={loading}
          loadingDistricts={loadingDistricts}
          loadingMahallas={loadingMahallas}
          onRegionClick={onRegionClick}
          onDistrictClick={onDistrictClick}
          onMahallaClick={onMahallaClick}
        />
      </div>
    </>
  );
}

