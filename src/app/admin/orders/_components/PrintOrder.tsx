'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { Order } from '@/interfaces/Order'

interface PrintOrderProps {
  order: Order
}

export default function PrintOrder({ order }: PrintOrderProps) {
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

  const formatMoney = (amount: number | string | { toString: () => string } | undefined) => {
    if (typeof amount === 'undefined') return '$0.00'
    
    // Convertir a número
    const value = typeof amount === 'number' 
      ? amount 
      : parseFloat(amount.toString())

    // Verificar si es un número válido
    if (isNaN(value)) return '$0.00'
    
    return `$${value.toFixed(2)}`
  }

  const getOrderItems = () => {
    if (!order?.items) return []
    return order.items
  }

  const formattedDate = order.creadoEl ? format(
    new Date(order.creadoEl),
    'dd/MM/yyyy HH:mm',
    { locale: es }
  ) : 'Fecha no disponible'

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Encabezado */}
      <div className="text-center mb-8 border-b pb-4">
        <div className="mb-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={120}
            height={40}
            className="mx-auto"
          />
        </div>
        <h1 className="text-3xl font-bold text-pink-600">Orden de Compra</h1>
        <p className="text-gray-600">#{order.numero}</p>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3 text-pink-600">Información del Cliente</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Nombre:</strong> {getUserInfo().nombre} {getUserInfo().apellido}</p>
            <p><strong>Email:</strong> {getUserInfo().email}</p>
            {getUserInfo().telefono && (
              <p><strong>Teléfono:</strong> {getUserInfo().telefono}</p>
            )}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3 text-pink-600">Detalles de la Orden</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Fecha:</strong> {formattedDate}</p>
            <p><strong>Estado:</strong> {order.estado}</p>
            <p><strong>Método de Pago:</strong> {getPaymentMethod()}</p>
            <p><strong>Total:</strong> {formatMoney(order.total)}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-pink-600">Productos</h2>
        {getOrderItems().length === 0 ? (
          <p className="text-center text-gray-500">No hay productos en esta orden</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Producto</th>
                <th className="text-right p-2">Cantidad</th>
                <th className="text-right p-2">Precio Unit.</th>
                <th className="text-right p-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {getOrderItems().map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.producto?.nombre || 'Producto no disponible'}</td>
                  <td className="text-right p-2">{item.cantidad || 0}</td>
                  <td className="text-right p-2">{formatMoney(item.precioUnit)}</td>
                  <td className="text-right p-2">
                    {formatMoney(item.cantidad * Number(item.precioUnit))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pie de Página */}
      <div className="text-center text-sm text-gray-500 border-t mt-8 pt-4">
        <div className="mb-2">
          <p className="font-medium text-pink-600">¡Gracias por tu compra!</p>
        </div>
        <div className="space-y-1">
          <p>Para cualquier consulta, contáctanos:</p>
          <p>📧 support@example.com | 📞 (123) 456-7890</p>
          <p>🏠 Dirección de la tienda, Ciudad</p>
        </div>
      </div>

      {/* Estilos específicos para impresión */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
            padding: 0;
            margin: 0;
          }
          @page {
            margin: 1cm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
} 