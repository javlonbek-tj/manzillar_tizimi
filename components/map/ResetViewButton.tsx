import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ResetViewButtonProps {
  onReset: () => void;
}

export function ResetViewButton({ onReset }: ResetViewButtonProps) {
  const { theme } = useTheme();

  return (
    <div className="bottom-4 left-84 z-1000 absolute flex flex-col gap-3">
      {/* HOME / RESET VIEW */}
      <button
        onClick={onReset}
        className={cn(
          'flex items-center gap-2 shadow-lg px-4 py-2 rounded-lg font-medium text-sm transition-colors',
          theme === 'dark'
            ? 'bg-gray-800 hover:bg-gray-700 text-white'
            : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'
        )}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Standard xarita
      </button>
    </div>
  );
}
