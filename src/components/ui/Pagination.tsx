'use client'

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Clases comunes para los botones
  const buttonClasses = 'p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <FaChevronLeft className="w-5 h-5" />
      </button>

      {/* Paginas */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`w-10 h-10 rounded-full 
                     ${currentPage === i + 1
                       ? 'bg-pink-500 text-white'
                       : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                     } transition-colors`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <FaChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
