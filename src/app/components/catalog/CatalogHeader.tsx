'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { FaFilter } from 'react-icons/fa'

export default function CatalogHeader({ 
  total, 
  showMobileFilters 
}: { 
  total: number
  showMobileFilters?: () => void 
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('ordenar', value)
    router.push(`/catalogo?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {showMobileFilters && (
          <button
            onClick={showMobileFilters}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            <FaFilter className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Catálogo de Productos
        </h1>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <span className="text-gray-600 dark:text-gray-300">
          {total} productos encontrados
        </span>
        
        <select
          className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-pink-500 outline-none"
          onChange={(e) => handleSort(e.target.value)}
          value={searchParams.get('ordenar') || 'nombre_asc'}
        >
          <option value="nombre_asc">Nombre A-Z</option>
          <option value="nombre_desc">Nombre Z-A</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
          <option value="createdAt_desc">Más nuevos</option>
          <option value="createdAt_asc">Más antiguos</option>
        </select>
      </div>
    </div>
  )
} 