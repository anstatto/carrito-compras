'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type PaginationProps = {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Refactorización de la función de cambio de página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return; // Asegura que la página esté dentro del rango

    const params = new URLSearchParams(searchParams.toString())
    params.set('pagina', page.toString())
    router.push(`/catalogo?${params.toString()}`)
  }

  // Clases comunes para los botones
  const buttonClasses = 'p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <FaChevronLeft className="w-5 h-5" />
      </button>

      {/* Paginas */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i + 1)}
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
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <FaChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
