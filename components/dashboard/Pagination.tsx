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
}: PaginationProps) {
  return (
    <div className='flex justify-between items-center mt-4'>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Jami: <span className="font-semibold text-blue-600">{totalItems}</span>
      </div>

      <div className='flex items-center gap-2'>
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={`p-2 rounded ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
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
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
              className="min-w-8 h-8 text-sm rounded text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          }`}
        >
          <ChevronRight className='w-4 h-4' />
        </button>

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="ml-4 px-3 py-1.5 text-xs rounded border cursor-pointer bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
