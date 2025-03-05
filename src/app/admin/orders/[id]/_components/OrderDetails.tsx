'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { Order } from '@/interfaces/Order'
import Image from 'next/image'
import PrintOrder from '../../_components/PrintOrder'
import { 
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaCreditCard,
  FaBox,
  FaDollarSign,
  FaShoppingCart,
  FaCalendarAlt,
  FaTag,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaSync,
  FaPhone
} from 'react-icons/fa'
import { EstadoPedido } from '@prisma/client'

interface OrderDetailsProps {
  initialOrder: Order;
  orderId: string;
}

export default function OrderDetails({ initialOrder, orderId }: OrderDetailsProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order>(initialOrder)
  const [isLoading, setIsLoading] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <FaBoxOpen className="text-yellow-500" />
      case 'PAGADO':
        return <FaCheckCircle className="text-green-500" />
      case 'ENVIADO':
        return <FaTruck className="text-blue-500" />
      default:
        return <FaTag className="text-gray-500" />
    }
  }

  const refreshOrder = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) throw new Error('Error al cargar la orden')
      const data = await res.json()
      // Convertir el estado y asegurar tipos correctos
      const orderWithCorrectTypes = {
        ...data,
        estado: data.estado as EstadoPedido,
        creadoEl: new Date(data.creadoEl),
        actualizadoEl: new Date(data.actualizadoEl)
      }
      setOrder(orderWithCorrectTypes)
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar los detalles de la orden')
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInfo = () => {
    if (!order.cliente) {
      return {
        nombre: 'No disponible',
        apellido: '',
        email: 'No disponible',
        telefono: null
      }
    }
    return order.cliente
  }

  const getPaymentMethod = () => {
    if (!order.metodoPago) {
      return 'No especificado'
    }
    return order.metodoPago.tipo
  }

  const formatMoney = (amount: number | null | undefined) => {
    if (amount === null || typeof amount === 'undefined') return 'RD$0.00'
    return `RD$${amount.toFixed(2)}`
  }

  const getOrderItems = () => {
    if (!order?.items) return []
    return order.items
  }

  const formattedDate = useMemo(() => {
    if (!order.creadoEl) return 'Fecha no disponible';
    try {
      const date = new Date(order.creadoEl);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha no disponible';
    }
  }, [order.creadoEl]);

  if (isLoading) return <div>Cargando...</div>
  if (!order) return <div>Orden no encontrada</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaShoppingCart className="text-pink-500 text-2xl" />
            Orden #{order.numero}
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            Creada el {formattedDate}
          </p>
        </div>
        <div className="space-x-2 flex items-center">
          <button
            onClick={refreshOrder}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            disabled={isLoading}
          >
            <FaSync className={`${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FaArrowLeft />
            Volver
          </button>
          <PrintOrder order={order} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-pink-500" />
            Información del Cliente
          </h2>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              <FaUser className="text-gray-400 w-5" />
              <span className="font-medium">Nombre:</span> 
              {getUserInfo().nombre} {getUserInfo().apellido}
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-gray-400 w-5" />
              <span className="font-medium">Email:</span> {getUserInfo().email}
            </p>
            {getUserInfo().telefono && (
              <p className="flex items-center gap-2">
                <FaPhone className="text-gray-400 w-5" />
                <span className="font-medium">Teléfono:</span> {getUserInfo().telefono}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBox className="text-pink-500" />
            Detalles de la Orden
          </h2>
          <div className="space-y-3">
            <p className="flex items-center gap-2">
              {getStatusIcon(order.estado)}
              <span className="font-medium">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                order.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                order.estado === 'PAGADO' ? 'bg-green-100 text-green-800' :
                order.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.estado}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <FaCreditCard className="text-gray-400 w-5" />
              <span className="font-medium">Método de Pago:</span> {getPaymentMethod()}
            </p>
            <p className="flex items-center gap-2">
              <FaDollarSign className="text-gray-400 w-5" />
              <span className="font-medium">Total:</span> {formatMoney(order.total)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b flex items-center gap-2">
          <FaShoppingCart className="text-pink-500" />
          Productos
        </h2>
        <div className="overflow-x-auto">
          {getOrderItems().length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No hay productos en esta orden
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getOrderItems().map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.producto?.imagenes?.[0] && (
                          <Image
                            src={item.producto.imagenes[0].url}
                            alt={item.producto.nombre || 'Producto'}
                            width={40}
                            height={40}
                            className="rounded-full mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.producto?.nombre || 'Producto no disponible'}
                          </div>
                          {item.enOferta && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                              Comprado con oferta
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.enOferta ? (
                        <div className="flex flex-col text-sm">
                          <span className="line-through text-gray-400">
                            {formatMoney(item.precioRegular)}
                          </span>
                          <span className="text-pink-600 font-medium">
                            {formatMoney(item.precioOferta)}
                          </span>
                          <span className="text-xs text-green-600">
                            {item.porcentajeDescuento}% descuento
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {formatMoney(item.precioUnit)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatMoney(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMoney(order.subtotal)}
                  </td>
                </tr>
                {order.impuestos > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Impuestos:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMoney(order.impuestos)}
                    </td>
                  </tr>
                )}
                {order.costoEnvio > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Envío:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMoney(order.costoEnvio)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatMoney(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
} 