import { Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Qidirish...',
}: SearchInputProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'p-4 border-b',
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      )}
    >
      <div className="relative">
        <Search
          className={cn(
            'top-1/2 left-3 absolute w-4 h-4 -translate-y-1/2',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}
        />

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'py-2 pr-4 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full',
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          )}
        />
      </div>
    </div>
  );
}
