'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaFilter, FaPercent, FaTrash } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

type Categoria = {
  id: string
  nombre: string
  productCount?: number
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
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Detectar filtros activos
  useEffect(() => {
    const filters = []
    if (currentFilters.categoria) filters.push('categoria')
    if (currentFilters.precioMin || currentFilters.precioMax) filters.push('precio')
    if (currentFilters.enOferta) filters.push('ofertas')
    setActiveFilters(filters)
  }, [currentFilters])

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    params.delete('pagina')
    router.push(`/catalogo?${params.toString()}`, { scroll: false })
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (priceRange.min && Number(priceRange.min) >= 0) {
      params.set('precioMin', priceRange.min)
    } else {
      params.delete('precioMin')
    }
    
    if (priceRange.max && Number(priceRange.max) > 0) {
      params.set('precioMax', priceRange.max)
    } else {
      params.delete('precioMax')
    }
    
    params.delete('pagina')
    router.push(`/catalogo?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    router.push('/catalogo')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 sticky top-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaFilter className="text-pink-500" />
          Filtros
        </h2>
        {activeFilters.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-pink-500 flex items-center gap-1"
          >
            <FaTrash size={12} />
            Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Categorías</h3>
        <div className="space-y-2">
          {categorias.map((categoria) => (
            <motion.label 
              key={categoria.id}
              whileHover={{ x: 4 }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="categoria"
                value={categoria.id}
                checked={currentFilters.categoria === categoria.id}
                onChange={(e) => handleFilter('categoria', e.target.value)}
                className="text-pink-500 focus:ring-pink-500"
              />
              <span className="text-gray-700 group-hover:text-pink-500">
                {categoria.nombre}
                {categoria.productCount && (
                  <span className="text-sm text-gray-400 ml-1">
                    ({categoria.productCount})
                  </span>
                )}
              </span>
            </motion.label>
          ))}
          <motion.label 
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="radio"
              name="categoria"
              value=""
              checked={!currentFilters.categoria}
              onChange={() => handleFilter('categoria', '')}
              className="text-pink-500 focus:ring-pink-500"
            />
            <span className="text-gray-700 group-hover:text-pink-500">
              Todas las categorías
            </span>
          </motion.label>
        </div>
      </div>

      {/* Rango de precios */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Rango de precios</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                placeholder="Mín"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                placeholder="Máx"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePriceFilter}
            className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Aplicar filtro
          </motion.button>
        </div>
      </div>

      {/* Filtros adicionales */}
      <div className="space-y-3">
        <motion.label 
          whileHover={{ x: 4 }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={currentFilters.enOferta === 'true'}
            onChange={(e) => handleFilter('enOferta', e.target.checked ? 'true' : '')}
            className="text-pink-500 focus:ring-pink-500"
          />
          <span className="flex items-center gap-2 text-gray-700 group-hover:text-pink-500">
            <FaPercent className="text-pink-500" />
            Solo ofertas
          </span>
        </motion.label>
      </div>

      {/* Indicador de filtros activos */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 pt-6 border-t"
          >
            <div className="text-sm text-gray-500">
              Filtros activos: {activeFilters.length}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeFilters.map(filter => (
                <span
                  key={filter}
                  className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                >
                  {filter}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 