import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
  disabled: boolean;
  darkMode: boolean;
}

export function ExportButton({
  onExport,
  isExporting,
  disabled,
  darkMode,
}: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      disabled={disabled || isExporting}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        darkMode
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isExporting ? (
        <>
          <Loader2 className='w-4 h-4 animate-spin' />
          Yuklanmoqda...
        </>
      ) : (
        <>
          <Download className='w-4 h-4' />
          Excel
        </>
      )}
    </button>
  );
}
