'use client'

import { useState, useEffect } from 'react'
import { EstadoPedido, TipoPago } from '@prisma/client'
import { FaSearch, FaTimes } from 'react-icons/fa'

export interface OrderFilters {
  estado?: EstadoPedido | undefined
  busqueda?: string
  metodoPago?: TipoPago | undefined
  fechaInicio?: string
  fechaFin?: string
  page: number
  limit: number
}

interface OrderFiltersProps {
  onFilterChange: (filters: OrderFilters) => void
  totalOrders: number
  currentPage: number
  totalPages: number
  initialFilters?: Partial<OrderFilters>
}

export default function OrderFilters({ 
  onFilterChange, 
  totalOrders, 
  currentPage, 
  totalPages,
  initialFilters = {} 
}: OrderFiltersProps) {
  const [filters, setFilters] = useState<OrderFilters>({
    page: currentPage,
    limit: 10,
    estado: initialFilters.estado,
    busqueda: initialFilters.busqueda || '',
    metodoPago: initialFilters.metodoPago,
    fechaInicio: initialFilters.fechaInicio,
    fechaFin: initialFilters.fechaFin
  })

  useEffect(() => {
    const hasInitialFiltersChanged = 
      initialFilters.estado !== filters.estado ||
      initialFilters.busqueda !== filters.busqueda ||
      initialFilters.metodoPago !== filters.metodoPago ||
      initialFilters.fechaInicio !== filters.fechaInicio ||
      initialFilters.fechaFin !== filters.fechaFin
    
    const hasPageChanged = currentPage !== filters.page

    if (hasInitialFiltersChanged || hasPageChanged) {
      setFilters(prev => ({
        ...prev,
        estado: initialFilters.estado ?? prev.estado,
        busqueda: initialFilters.busqueda ?? prev.busqueda,
        metodoPago: initialFilters.metodoPago ?? prev.metodoPago,
        fechaInicio: initialFilters.fechaInicio ?? prev.fechaInicio,
        fechaFin: initialFilters.fechaFin ?? prev.fechaFin,
        page: currentPage
      }))
    }
  }, [currentPage, initialFilters.estado, initialFilters.busqueda, initialFilters.metodoPago, initialFilters.fechaInicio, initialFilters.fechaFin, filters.estado, filters.busqueda, filters.metodoPago, filters.fechaInicio, filters.fechaFin, filters.page])

  const handleFilterChange = (newFilters: Partial<OrderFilters>) => {
    const updatedFilters = { 
      ...filters, 
      ...newFilters,
      page: 'page' in newFilters ? newFilters.page! : 1
    }
    
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de orden o cliente..."
            value={filters.busqueda || ''}
            onChange={(e) => handleFilterChange({ busqueda: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
          />
          {filters.busqueda && (
            <button
              onClick={() => handleFilterChange({ busqueda: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <select
          value={filters.estado || ''}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange({ 
              estado: value ? (value as EstadoPedido) : undefined 
            })
          }}
          className="rounded-lg border border-gray-300 py-2 px-4"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADO">Pagado</option>
          <option value="PREPARANDO">Preparando</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <select
          value={filters.metodoPago || ''}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange({ 
              metodoPago: value ? (value as TipoPago) : undefined 
            })
          }}
          className="rounded-lg border border-gray-300 py-2 px-4"
        >
          <option value="">Todos los métodos de pago</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="PAYPAL">PayPal</option>
          <option value="MERCADO_PAGO">Mercado Pago</option>
        </select>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg">
        <span className="text-sm text-gray-600">
          Mostrando {Math.min((currentPage - 1) * filters.limit + 1, totalOrders)} - 
          {Math.min(currentPage * filters.limit, totalOrders)} de {totalOrders} órdenes
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange({ page: currentPage - 1 })}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handleFilterChange({ page: currentPage + 1 })}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
} 