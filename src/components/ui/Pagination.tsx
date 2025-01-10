interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 
                 hover:bg-gray-200 transition-colors"
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg ${
            currentPage === page
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } transition-colors`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 
                 hover:bg-gray-200 transition-colors"
      >
        Siguiente
      </button>
    </div>
  )
} 