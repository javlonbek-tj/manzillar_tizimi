import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  darkMode: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onPrevious,
  onNext,
  darkMode,
}: PaginationProps) {
  return (
    <div className='flex justify-between items-center mt-4'>
      <div
        className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
      >
        Jami: <span className='font-semibold text-blue-600'>{totalItems}</span>
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : darkMode
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className='w-4 h-4' />
        </button>

        <div className='flex gap-1'>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={i}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-8 h-8 text-sm rounded ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className='text-gray-400'>...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`min-w-8 h-8 text-sm rounded ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`p-2 rounded ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : darkMode
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronRight className='w-4 h-4' />
        </button>

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className={`ml-4 px-3 py-1.5 text-xs rounded border cursor-pointer ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}
