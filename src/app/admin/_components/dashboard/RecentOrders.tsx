'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  numero: string
  cliente: {
    nombre: string
    email: string
  }
  total: string | number
  estado: 'PENDIENTE' | 'PAGADO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'
  creadoEl: string
}

export default function RecentOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=5&sort=desc')
      if (!res.ok) throw new Error('Error al cargar pedidos')
      const data = await res.json()
      setOrders(data.orders)
    } catch (error) {
      toast.error('Error al cargar los pedidos recientes')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Order['estado']): string => {
    const colors = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      PAGADO: 'bg-blue-100 text-blue-800',
      PREPARANDO: 'bg-purple-100 text-purple-800',
      ENVIADO: 'bg-indigo-100 text-indigo-800',
      ENTREGADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="divide-y divide-gray-200">
        {orders.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No hay pedidos recientes</p>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/orders/${order.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Pedido #{order.numero}
                  </p>
                  <p className="text-sm text-gray-500">{order.cliente.nombre}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(order.creadoEl), "d 'de' MMMM, HH:mm", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                    {order.estado}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${Number(order.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t">
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          Ver todos los pedidos →
        </button>
      </div>
    </div>
  )
} 