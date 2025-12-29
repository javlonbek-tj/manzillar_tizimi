import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import type { RegionData, DistrictData, MahallaData } from '@/types/map';

interface SelectionInfoProps {
  selectedRegion: RegionData | null;
  selectedDistrict: DistrictData | null;
  selectedMahalla: MahallaData | null;
  onBack?: () => void;
}

export function SelectionInfo({
  selectedRegion,
  selectedDistrict,
  selectedMahalla,
  onBack,
}: SelectionInfoProps) {
  const { theme } = useTheme();

  if (!selectedRegion && !selectedDistrict && !selectedMahalla) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-4 border-b',
        theme === 'dark'
          ? 'bg-gray-750 border-gray-700'
          : 'bg-gray-50 border-gray-200'
      )}
    >
      <div
        className={cn(
          'mb-2 text-xs',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}
      >
        Tanlangan:
      </div>

      {selectedRegion && (
        <div
          className={cn(
            'mb-1 text-sm',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}
        >
          📍 {selectedRegion.nameUz}
        </div>
      )}

      {selectedDistrict && (
        <div
          className={cn(
            'mb-1 text-sm',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}
        >
          📍 {selectedDistrict.nameUz}
        </div>
      )}

      {selectedMahalla && (
        <div
          className={cn(
            'text-sm',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}
        >
          📍 {selectedMahalla.nameUz}
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="mt-2 text-blue-500 hover:text-blue-600 text-xs"
        >
          ← Orqaga qaytish
        </button>
      )}
    </div>
  );
}
