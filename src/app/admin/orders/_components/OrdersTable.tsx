'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TipoPago } from '@prisma/client'
import { useRouter } from 'next/navigation'

import { Order } from '@/interfaces/Order'

interface MetodoPago {
  tipo: TipoPago
}

interface OrdersTableProps {
  orders: Order[]
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>
}

const formatMoney = (amount: number | string | { toString: () => string }) => {
  const value = typeof amount === 'number' ? amount : parseFloat(amount.toString())
  return `$${value.toFixed(2)}`
}

const getPaymentMethod = (metodoPago: MetodoPago | null | undefined) => {
  if (!metodoPago) return 'No especificado'
  return metodoPago.tipo || 'No especificado'
}

export default function OrdersTable({ orders, onUpdateStatus }: OrdersTableProps) {
  const router = useRouter()

  if (!Array.isArray(orders)) {
    return <div>No hay órdenes para mostrar</div>
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      PAGADO: 'bg-green-100 text-green-800',
      PREPARANDO: 'bg-blue-100 text-blue-800',
      ENVIADO: 'bg-purple-100 text-purple-800',
      ENTREGADO: 'bg-gray-100 text-gray-800',
      CANCELADO: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {orders.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No hay órdenes disponibles
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <motion.tr 
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.cliente?.nombre || 'Cliente no especificado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMoney(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.estado}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className={`text-sm rounded-full px-3 py-1 font-medium ${getStatusColor(order.estado)}`}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="PAGADO">Pagado</option>
                      <option value="PREPARANDO">Preparando</option>
                      <option value="ENVIADO">Enviado</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getPaymentMethod(order.metodoPago)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.creadoEl), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="text-pink-600 hover:text-pink-900"
                    >
                      Ver detalles
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      🖨️ Imprimir
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 