'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TipoPago } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { 
  FaEye, 
  FaPrint, 
  FaCheck, 
  FaTruck, 
  FaBox,
  FaTimesCircle,
  FaClock,
  FaCreditCard
} from 'react-icons/fa'

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return <FaClock className="text-yellow-500" />
      case 'PAGADO': return <FaCheck className="text-green-500" />
      case 'PREPARANDO': return <FaBox className="text-blue-500" />
      case 'ENVIADO': return <FaTruck className="text-purple-500" />
      case 'ENTREGADO': return <FaCheck className="text-gray-500" />
      case 'CANCELADO': return <FaTimesCircle className="text-red-500" />
      default: return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {orders.length === 0 ? (
        <div className="p-8 text-center">
          <FaBox className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">No hay órdenes disponibles</p>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-pink-600">#{order.numero}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {order.cliente?.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {order.cliente?.nombre} {order.cliente?.apellido}
                        </p>
                        <p className="text-xs text-gray-500">{order.cliente?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{formatMoney(order.total)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.estado)}
                      <select
                        value={order.estado}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 font-medium
                          ${getStatusColor(order.estado)}`}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PAGADO">Pagado</option>
                        <option value="PREPARANDO">Preparando</option>
                        <option value="ENVIADO">Enviado</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="text-gray-400" />
                      <span className="text-sm">{getPaymentMethod(order.metodoPago)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      {format(new Date(order.creadoEl), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="text-pink-600 hover:text-pink-700 p-2 rounded-full hover:bg-pink-50"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="text-gray-600 hover:text-gray-700 p-2 rounded-full hover:bg-gray-50"
                      >
                        <FaPrint />
                      </button>
                    </div>
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