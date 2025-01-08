'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FaFilter } from 'react-icons/fa'

type Categoria = {
  id: string
  nombre: string
}

export default function FilterSidebar({ 
  categorias,
  currentFilters 
}: { 
  categorias: Categoria[]
  currentFilters: { [key: string]: string | undefined }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.precioMin || '',
    max: currentFilters.precioMax || ''
  })

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('pagina', '1') // Reset página al filtrar
    router.push(`/catalogo?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceRange.min) params.set('precioMin', priceRange.min)
    if (priceRange.max) params.set('precioMax', priceRange.max)
    params.set('pagina', '1')
    router.push(`/catalogo?${params.toString()}`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <FaFilter />
        Filtros
      </h2>

      {/* Categorías */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Categorías
        </h3>
        <div className="space-y-2">
          {categorias.map((categoria) => (
            <label 
              key={categoria.id}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              <input
                type="radio"
                name="categoria"
                value={categoria.id}
                checked={currentFilters.categoria === categoria.id}
                onChange={(e) => handleFilter('categoria', e.target.value)}
                className="text-pink-500 focus:ring-pink-500"
              />
              {categoria.nombre}
            </label>
          ))}
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer">
            <input
              type="radio"
              name="categoria"
              value=""
              checked={!currentFilters.categoria}
              onChange={() => handleFilter('categoria', '')}
              className="text-pink-500 focus:ring-pink-500"
            />
            Todas las categorías
          </label>
        </div>
      </div>

      {/* Rango de precios */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Rango de precios
        </h3>
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Precio mínimo"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-full px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-pink-500 outline-none"
          />
          <input
            type="number"
            placeholder="Precio máximo"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-full px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-pink-500 outline-none"
          />
          <button
            onClick={handlePriceFilter}
            className="w-full px-4 py-2 bg-pink-500 text-white rounded-full 
                     hover:bg-pink-600 transition-colors"
          >
            Aplicar filtro
          </button>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <button
        onClick={() => router.push('/catalogo')}
        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  )
} 