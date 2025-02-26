'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import PrintOrder from '../_components/PrintOrder'
import { Order } from '@/interfaces/Order'
import Image from 'next/image'

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`)
        if (!res.ok) throw new Error('Error al cargar la orden')
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar los detalles de la orden')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (isLoading) return <div>Cargando...</div>
  if (!order) return <div>Orden no encontrada</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orden #{order.numero}
          </h1>
          <p className="text-sm text-gray-500">
            Creada el {format(new Date(order.creadoEl), 'dd/MM/yyyy HH:mm', { locale: es })}
          </p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Volver
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
          >
            <span>🖨️ Imprimir Orden</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Cliente */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {order.cliente.nombre}</p>
            <p><span className="font-medium">Email:</span> {order.cliente.email}</p>
          </div>
        </div>

        {/* Detalles de la Orden */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Detalles de la Orden</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Estado:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                order.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                order.estado === 'PAGADO' ? 'bg-green-100 text-green-800' :
                order.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.estado}
              </span>
            </p>
            <p><span className="font-medium">Método de Pago:</span> {order.metodoPago.tipo}</p>
            <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b">Productos</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.producto.imagenes[0] && (
                      <Image
                        src={item.producto.imagenes[0].url}
                        alt={item.producto.nombre}
                        width={40}
                        height={40}
                        className="rounded-full mr-3 object-cover"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {item.producto.nombre}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.cantidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${item.precioUnit.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${(item.cantidad * Number(item.precioUnit)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versión imprimible (oculta por defecto) */}
      <div className="hidden print:block">
        <PrintOrder order={order} />
      </div>
    </div>
  )
} 