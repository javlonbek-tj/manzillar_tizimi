import type { Region, District, TabType } from '@/types/dashboard';
import { ExportButton } from './ExportButton';

interface DashboardFiltersProps {
  activeTab: TabType;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (regionId: string) => void;
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
  availableDistricts: District[];
  regions: Region[];
  darkMode: boolean;
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
  selectedHidden?: string;
  onHiddenChange?: (value: string) => void;
}

export function DashboardFilters({
  activeTab,
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedDistrict,
  onDistrictChange,
  availableDistricts,
  regions,
  darkMode,
  onExport,
  isExporting,
  canExport,
  selectedHidden = '',
  onHiddenChange = () => {},
}: DashboardFiltersProps) {
  return (
    <div className='p-4'>
      <div className='flex flex-wrap items-center gap-4 mb-4'>
        {/* Search Input */}
        <input
          type='text'
          placeholder='Qidiruv...'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`flex-1 min-w-[200px] px-4 py-2 text-sm rounded-lg border ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />

        {/* Region Select */}
        {activeTab !== 'regions' && (
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className={`px-4 py-2 rounded-lg border text-sm cursor-pointer ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]`}
          >
            <option value=''>Hudud tanlang</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nameUz}
              </option>
            ))}
          </select>
        )}

        {/* District Select */}
        {(activeTab === 'mahallas' || activeTab === 'streets') &&
          selectedRegion && (
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]`}
            >
              <option value=''>Tuman tanlang</option>
              {availableDistricts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.nameUz}
                </option>
              ))}
            </select>
          )}

        {/* Hidden Status Filter for Mahallas */}
        {activeTab === 'mahallas' && (
          <select
            value={selectedHidden}
            onChange={(e) => onHiddenChange(e.target.value)}
            className={`px-4 py-2 rounded-lg border text-sm cursor-pointer ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]`}
          >
            <option value=''>Yashirilgan (hammas)</option>
            <option value='true'>Yashirilgan (ha)</option>
            <option value='false'>Yashirilgan (yo'q)</option>
          </select>
        )}

        {/* Export Button */}
        <ExportButton
          onExport={onExport}
          isExporting={isExporting}
          disabled={!canExport}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
