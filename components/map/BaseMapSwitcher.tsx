'use client';

import { Moon, Sun, Satellite as MapIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import type { BaseMapKey } from '@/services/baseMaps';

interface BaseMapSwitcherProps {
  currentBaseMap: BaseMapKey;
  onBaseMapChange: (baseMap: BaseMapKey) => void;
}

export function BaseMapSwitcher({
  currentBaseMap,
  onBaseMapChange,
}: BaseMapSwitcherProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`top-4 left-1/2 z-1000 absolute flex shadow-lg rounded-lg overflow-hidden -translate-x-1/2 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
      }`}
    >
      {/* Dark */}
      <div
        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-default ${
          currentBaseMap === 'dark'
            ? 'bg-blue-600 text-white'
            : theme === 'dark'
            ? 'text-gray-300'
            : 'text-gray-800'
        }`}
        title="Qorong'i xarita"
      >
        <Moon className='w-4 h-4' />
        Qorong&apos;i
      </div>

      {/* Satellite */}
      <div
        className={`px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-default ${
          currentBaseMap === 'satellite'
            ? 'bg-blue-600 text-white'
            : theme === 'dark'
            ? 'text-gray-300'
            : 'text-gray-800'
        }`}
        title="Sun'iy yo'ldosh"
      >
        <MapIcon className='w-4 h-4' />
        Sun&apos;iy yo&apos;ldosh
      </div>
    </div>
  );
}
