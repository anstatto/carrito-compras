'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  numero: string
  clienteId: string
  cliente: {
    nombre: string
    email: string
  }
  total: number
  estado: 'PENDIENTE' | 'PAGADO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'
  metodoPago: string
  creadoEl: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Error al cargar pedidos')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      toast.error('Error al cargar los pedidos')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['estado']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      })

      if (!res.ok) throw new Error('Error al actualizar el pedido')
      
      toast.success('Estado del pedido actualizado correctamente')
      await fetchOrders() // Recargar pedidos después de actualizar
    } catch (error) {
      toast.error('Error al actualizar el estado del pedido')
      console.error(error)
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

  const filteredOrders = orders.filter(order => 
    order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por número de pedido, nombre o email del cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.numero}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{order.cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.estado)}`}>
                        {order.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.metodoPago}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.creadoEl).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARANDO')}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Marcar como en preparación"
                        >
                          <FaCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
                              updateOrderStatus(order.id, 'CANCELADO')
                            }
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Cancelar pedido"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}