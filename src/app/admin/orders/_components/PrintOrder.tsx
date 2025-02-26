'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import { Order } from '@/interfaces/Order'

interface PrintOrderProps {
  order: Order
}

export default function PrintOrder({ order }: PrintOrderProps) {
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
            <p><strong>Nombre:</strong> {order.cliente.nombre}</p>
            <p><strong>Email:</strong> {order.cliente.email}</p>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3 text-pink-600">Detalles de la Orden</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Fecha:</strong> {format(new Date(order.creadoEl), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
            <p><strong>Estado:</strong> <span className={`px-2 py-1 rounded-full text-sm ${
              order.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
              order.estado === 'PAGADO' ? 'bg-green-100 text-green-800' :
              order.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>{order.estado}</span></p>
            <p><strong>Método de Pago:</strong> {order.metodoPago.tipo}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-pink-50">
              <th className="py-3 px-4 text-left">Producto</th>
              <th className="py-3 px-4 text-center">Cantidad</th>
              <th className="py-3 px-4 text-right">Precio Unit.</th>
              <th className="py-3 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {item.producto.imagenes[0] && (
                      <Image
                        src={item.producto.imagenes[0].url}
                        alt={item.producto.nombre}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <span>{item.producto.nombre}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">{item.cantidad}</td>
                <td className="py-4 px-4 text-right">${item.precioUnit.toFixed(2)}</td>
                <td className="py-4 px-4 text-right">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-bold bg-pink-50">
              <td colSpan={3} className="py-4 px-4 text-right">Total:</td>
              <td className="py-4 px-4 text-right">${order.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pie de Página */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
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