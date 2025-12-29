import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import type { RegionData, DistrictData } from '@/types/map';
import { Skeleton } from '@/components/shared/Skeleton';

interface Stats {
  regions: number;
  districts: number;
  mahallas: number;
  streets: number;
}

interface StatsPanelProps {
  stats: Stats;
  selectedRegion: RegionData | null;
  selectedDistrict: DistrictData | null;
  mahallasCount: number;
  loading?: boolean;
}

export function StatsPanel({
  stats,
  selectedRegion,
  selectedDistrict,
  mahallasCount,
  loading = false,
}: StatsPanelProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'top-4 right-4 z-1000 absolute shadow-lg p-4 rounded-lg',
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      )}
    >
      <h3 className="mb-3 font-bold text-lg">Statistika</h3>

      {/* Stats layout: when region/district selected show contextual labels */}
      <div className="space-y-2 text-sm">
        {loading ? (
          <>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </>
        ) : (
          <>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">
                {selectedRegion ? 'Viloyat:' : 'Viloyatlar:'}
              </span>
              <span className="font-semibold">
                {selectedRegion ? selectedRegion.nameUz : stats.regions}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">
                {selectedDistrict ? 'Tuman:' : 'Tumanlar:'}
              </span>
              <span className="font-semibold">
                {selectedDistrict ? selectedDistrict.nameUz : stats.districts}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Mahallalar:</span>
              <span className="font-semibold">
                {/* If district selected, show mahallas count from mahallas state; otherwise stats */}
                {selectedDistrict ? mahallasCount : stats.mahallas}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Ko'chalar:</span>
              <span className="font-semibold">{stats.streets}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

