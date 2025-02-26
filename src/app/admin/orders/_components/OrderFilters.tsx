'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFilter, FaTimes } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { es } from 'date-fns/locale'

export type OrderFilters = {
  estado?: string
  metodoPago?: string
  fechaDesde?: Date | null
  fechaHasta?: Date | null
  clienteNombre?: string
  page?: number
  limit?: number
}

interface OrderFiltersProps {
  onFilterChange: (filters: OrderFilters) => void
  totalOrders: number
  currentPage: number
  totalPages: number
}

export default function OrderFilters({ 
  onFilterChange, 
  totalOrders,
  currentPage,
  totalPages
}: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (newFilters: Partial<OrderFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 } // Reset to page 1 when filters change
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const handlePageChange = (newPage: number) => {
    const updatedFilters = { ...filters, page: newPage }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="space-y-4">
      <motion.div 
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '48px' }}
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <FaFilter className="text-pink-500" />
            <span className="font-medium">Filtros</span>
            {Object.keys(filters).length > 0 && (
              <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
          
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filters.estado || ''}
                    onChange={(e) => handleFilterChange({ estado: e.target.value })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="PREPARANDO">Preparando</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={filters.metodoPago || ''}
                    onChange={(e) => handleFilterChange({ metodoPago: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">Todos</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="EFECTIVO">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={filters.clienteNombre || ''}
                    onChange={(e) => handleFilterChange({ clienteNombre: e.target.value })}
                    placeholder="Buscar por nombre..."
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de Fechas
                  </label>
                  <div className="flex gap-4">
                    <DatePicker
                      selected={filters.fechaDesde}
                      onChange={(date) => handleFilterChange({ fechaDesde: date })}
                      placeholderText="Fecha desde"
                      className="w-full border rounded-lg p-2"
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                    />
                    <DatePicker
                      selected={filters.fechaHasta}
                      onChange={(date) => handleFilterChange({ fechaHasta: date })}
                      placeholderText="Fecha hasta"
                      className="w-full border rounded-lg p-2"
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Paginación */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalOrders)} de {totalOrders} órdenes
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          
          {/* Números de página */}
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-pink-500 text-white'
                    : 'border border-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
} 