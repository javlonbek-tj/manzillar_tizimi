import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';
import { SkeletonList } from '@/components/shared/Skeleton';

type SidebarLevel = 'regions' | 'districts' | 'mahallas';

interface SidebarListProps {
  level: SidebarLevel;
  regions?: RegionData[];
  districts?: DistrictData[];
  mahallas?: MahallaData[];
  searchTerm: string;
  selectedMahalla?: MahallaData | null;
  loading?: boolean;
  loadingDistricts?: boolean;
  loadingMahallas?: boolean;
  onRegionClick?: (region: RegionData) => void;
  onDistrictClick?: (district: DistrictData) => void;
  onMahallaClick?: (mahalla: MahallaData) => void;
}

export function SidebarList({
  level,
  regions = [],
  districts = [],
  mahallas = [],
  searchTerm,
  selectedMahalla,
  loading = false,
  loadingDistricts = false,
  loadingMahallas = false,
  onRegionClick,
  onDistrictClick,
  onMahallaClick,
}: SidebarListProps) {
  const { theme } = useTheme();

  const listItemClass = cn(
    'px-3 py-2 rounded w-full text-sm text-left transition-colors',
    theme === 'dark'
      ? 'text-white hover:bg-gray-700'
      : 'text-gray-900 hover:bg-gray-100'
  );

  const filteredRegions = regions.filter((r) =>
    r.nameUz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDistricts = districts.filter((d) =>
    d.nameUz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMahallas = mahallas.filter((m) =>
    m.nameUz.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Regions List */}
      {level === 'regions' && (
        <div className="p-4">
          <h4 className="mb-2 font-semibold text-gray-400 text-sm">
            Viloyatlar
          </h4>
          {loading ? (
            <SkeletonList count={10} />
          ) : filteredRegions.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              Ma'lumot topilmadi
            </div>
          ) : (
            <div className="space-y-1">
              {filteredRegions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => onRegionClick?.(region)}
                  className={listItemClass}
                >
                  {region.nameUz}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Districts List */}
      {level === 'districts' && (
        <div className="p-4">
          <h4 className="mb-2 font-semibold text-gray-400 text-sm">
            Tumanlar
          </h4>
          {loadingDistricts ? (
            <SkeletonList count={10} />
          ) : filteredDistricts.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              Ma'lumot topilmadi
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDistricts.map((district) => (
                <button
                  key={district.id}
                  onClick={() => onDistrictClick?.(district)}
                  className={listItemClass}
                >
                  {district.nameUz}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mahallas List */}
      {level === 'mahallas' && (
        <div className="p-4">
          <h4 className="mb-2 font-semibold text-gray-400 text-sm">
            Mahallalar
          </h4>
          {loadingMahallas ? (
            <SkeletonList count={10} />
          ) : filteredMahallas.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              Ma'lumot topilmadi
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMahallas.map((mahalla) => (
                <button
                  key={mahalla.id}
                  onClick={() => onMahallaClick?.(mahalla)}
                  className={cn(
                    'px-3 py-2 rounded w-full text-sm text-left transition-colors',
                    selectedMahalla?.id === mahalla.id
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {mahalla.nameUz}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

