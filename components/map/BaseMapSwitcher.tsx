'use client';

import { Moon, Satellite as MapIcon } from 'lucide-react';
import type { BaseMapKey } from '@/services/baseMaps';
import { cn } from '@/lib/utils';

interface BaseMapSwitcherProps {
  currentBaseMap: BaseMapKey;
  onBaseMapChange: (baseMap: BaseMapKey) => void;
}

export function BaseMapSwitcher({
  currentBaseMap,
  onBaseMapChange,
}: BaseMapSwitcherProps) {
  return (
    <div
      className="right-4 bottom-4 z-[1000] absolute flex shadow-2xl rounded-xl overflow-hidden bg-gray-900/90 backdrop-blur-md border border-white/10"
    >
      {/* Dark */}
      <button
        onClick={() => onBaseMapChange('dark')}
        className={cn(
          'px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200',
          currentBaseMap === 'dark'
            ? 'bg-primary text-primary-foreground shadow-inner'
            : 'text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer'
        )}
        title="Qorong'i xarita"
      >
        <Moon className='w-4 h-4' />
        Qorong&apos;i
      </button>

      {/* Satellite */}
      <button
        onClick={() => onBaseMapChange('satellite')}
        className={cn(
          'px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200',
          currentBaseMap === 'satellite'
            ? 'bg-primary text-primary-foreground shadow-inner'
            : 'text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer'
        )}
        title="Sun'iy yo'ldosh"
      >
        <MapIcon className='w-4 h-4' />
        Sun&apos;iy yo&apos;ldosh
      </button>
    </div>
  );
}
