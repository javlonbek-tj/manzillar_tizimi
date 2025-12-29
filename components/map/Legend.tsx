import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function Legend() {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'right-4 bottom-4 z-1000 absolute shadow-lg p-4 rounded-lg',
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      )}
    >
      <h4 className="mb-2 font-bold text-sm">Belgilar</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 opacity-50 border border-blue-400 rounded w-4 h-4"></div>
          <span>Viloyatlar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-500 opacity-60 border border-green-400 rounded w-4 h-4"></div>
          <span>Tumanlar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 opacity-70 border border-orange-400 rounded w-4 h-4"></div>
          <span>Mahallalar</span>
        </div>
      </div>
    </div>
  );
}

