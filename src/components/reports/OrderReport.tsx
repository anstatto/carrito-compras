import { Order } from '@/interfaces/Order'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface OrderReportProps {
  order: Order
}

const formatMoney = (amount: number | null | undefined) => {
  if (amount === null || typeof amount === 'undefined') return 'RD$0.00'
  return `RD$${amount.toFixed(2)}`
}

export default function OrderReport({ order }: OrderReportProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white" id="order-report">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ArlingLow Care</h1>
        <p className="text-xl mt-2">Orden #{order.numero}</p>
        <p className="text-sm text-gray-500 mt-1">
          {order.creadoEl ? format(new Date(order.creadoEl), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Fecha no disponible'}
        </p>
      </div>

      {/* Información del Cliente */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Información del Cliente</h2>
          <div className="space-y-1">
            <p>{order.cliente?.nombre} {order.cliente?.apellido}</p>
            <p>Email: {order.cliente?.email}</p>
            <p>Tel: {order.cliente?.telefono || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Dirección de Envío</h2>
          <div className="space-y-1">
            <p>{order.direccion?.calle} #{order.direccion?.numero}</p>
            <p>{order.direccion?.sector}, {order.direccion?.municipio}</p>
            <p>{order.direccion?.provincia}</p>
            {order.direccion?.agenciaEnvio && (
              <>
                <p>{order.direccion.agenciaEnvio.replace(/_/g, ' ')}</p>
                {order.direccion.sucursalAgencia && (
                  <p>{order.direccion.sucursalAgencia}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-center">Cantidad</th>
              <th className="px-4 py-2 text-right">Precio</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items?.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
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
                      <p className="font-medium">{item.producto.nombre}</p>
                      {item.enOferta && (
                        <span className="text-xs text-pink-600">En oferta</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{item.cantidad}</td>
                <td className="px-4 py-2 text-right">
                  {item.enOferta ? (
                    <div>
                      <span className="line-through text-gray-400">
                        {formatMoney(item.precioRegular)}
                      </span>
                      <br />
                      <span className="text-pink-600">
                        {formatMoney(item.precioOferta)}
                      </span>
                    </div>
                  ) : (
                    formatMoney(item.precioUnit)
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {formatMoney(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal:</td>
              <td className="px-4 py-2 text-right">{formatMoney(order.subtotal)}</td>
            </tr>
            {order.impuestos > 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right font-medium">Impuestos:</td>
                <td className="px-4 py-2 text-right">{formatMoney(order.impuestos)}</td>
              </tr>
            )}
            {order.costoEnvio > 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right font-medium">Envío:</td>
                <td className="px-4 py-2 text-right">{formatMoney(order.costoEnvio)}</td>
              </tr>
            )}
            <tr className="font-bold">
              <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
              <td className="px-4 py-2 text-right">{formatMoney(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pie de página */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>¡Gracias por su compra!</p>
      </div>
    </div>
  )
} 