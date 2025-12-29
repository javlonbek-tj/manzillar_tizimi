import { Moon, Sun, Satellite as MapIcon } from 'lucide-react';
import type { BaseMapKey } from '@/services/baseMaps';

interface BaseMapSwitcherProps {
  currentBaseMap: BaseMapKey;
  onBaseMapChange: (baseMap: BaseMapKey) => void;
}

export function BaseMapSwitcher({
  currentBaseMap,
  onBaseMapChange,
}: BaseMapSwitcherProps) {
  return (
    <div className="top-4 left-1/2 z-1000 absolute flex bg-gray-800 shadow-lg rounded-lg overflow-hidden -translate-x-1/2">
      {/* Dark */}
      <button
        onClick={() => onBaseMapChange('dark')}
        className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
          currentBaseMap === 'dark'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="Qorong'i xarita"
      >
        <Moon className="w-4 h-4" />
        Qorong&apos;i
      </button>

      {/* Light */}
      <button
        onClick={() => onBaseMapChange('light')}
        className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 border-x border-gray-700 ${
          currentBaseMap === 'light'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="Yorug' xarita"
      >
        <Sun className="w-4 h-4" />
        Yorug&apos;
      </button>

      {/* Satellite */}
      <button
        onClick={() => onBaseMapChange('satellite')}
        className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
          currentBaseMap === 'satellite'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700'
        }`}
        title="Sun'iy yo'ldosh"
      >
        <MapIcon className="w-4 h-4" />
        Sun&apos;iy yo&apos;ldosh
      </button>
    </div>
  );
}
