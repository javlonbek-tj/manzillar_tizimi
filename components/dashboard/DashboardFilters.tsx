import type { Region, District, TabType } from '@/types/dashboard';
import { ExportButton } from './ExportButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          className="flex-1 min-w-[200px] px-4 py-2 text-sm rounded-lg border transition-all bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:border-primary shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10"
        />

        {/* Region Select */}
        {activeTab !== 'regions' && (
          <Select
            value={selectedRegion || "all"}
            onValueChange={(value) => onRegionChange(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Hudud tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hudud tanlang</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.nameUz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* District Select */}
        {(activeTab === 'mahallas' || activeTab === 'streets' || activeTab === 'addresses') &&
          selectedRegion && (
            <Select
              value={selectedDistrict || "all"}
              onValueChange={(value) => onDistrictChange(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tuman tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tuman tanlang</SelectItem>
                {availableDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.nameUz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

        {/* Hidden Status Filter for Mahallas */}
        {activeTab === 'mahallas' && (
          <Select
            value={selectedHidden || "all"}
            onValueChange={(value) => onHiddenChange(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Yashirilgan (hammasi)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Yashirilgan (hammasi)</SelectItem>
              <SelectItem value="true">Yashirilgan (ha)</SelectItem>
              <SelectItem value="false">Yashirilgan (yo'q)</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Export Button */}
        <ExportButton
          onExport={onExport}
          isExporting={isExporting}
          disabled={!canExport}
        />
      </div>
    </div>
  );
}
