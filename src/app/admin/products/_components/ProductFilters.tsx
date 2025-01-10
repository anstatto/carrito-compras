'use client'

import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import debounce from 'lodash/debounce'

interface FilterProps {
  categories: { id: string; nombre: string }[]
  onFilter: (filters: FilterValues) => void
}

interface FilterValues {
  categoria?: string
  precioMin?: string
  precioMax?: string
  enOferta?: boolean
  activo?: boolean
  destacado?: boolean
  busqueda?: string
}

// Memoizar los inputs individuales
const FilterInput = memo(({ 
  label, 
  type, 
  value, 
  onChange,
  ...props 
}: {
  label: string
  type: string
  value: string | boolean
  onChange: (value: string | boolean) => void
  // Extender de los tipos de input HTML
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {type === 'checkbox' ? (
      <input
        type="checkbox"
        checked={value as boolean}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
        {...props}
      />
    ) : (
      <input
        type={type}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-gray-300 focus:ring-pink-500 focus:border-pink-500"
        {...props}
      />
    )}
  </div>
))
FilterInput.displayName = 'FilterInput'

// Mover el debounce fuera del componente
const debouncedFilterFn = debounce((fn: (filters: FilterValues) => void, filters: FilterValues) => {
  fn(filters)
}, 300)

export const ProductFilters = memo(function ProductFilters({ 
  categories, 
  onFilter 
}: FilterProps) {
  const [filters, setFilters] = useState<FilterValues>({})

  const handleChange = useCallback((key: keyof FilterValues, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    debouncedFilterFn(onFilter, newFilters)
  }, [filters, onFilter])

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Todas</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Precio</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              onChange={(e) => handleChange('precioMin', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            />
            <input
              type="number"
              placeholder="Max"
              onChange={(e) => handleChange('precioMax', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            placeholder="Buscar productos..."
            onChange={(e) => handleChange('busqueda', e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={(e) => handleChange('enOferta', e.target.checked)}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm text-gray-700">En Oferta</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={(e) => handleChange('destacado', e.target.checked)}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm text-gray-700">Destacados</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={(e) => handleChange('activo', e.target.checked)}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm text-gray-700">Activos</span>
        </label>
      </div>
    </motion.div>
  )
}) 