import { prisma } from '@/lib/prisma'
import OrderDetails from './_components/OrderDetails'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params

  const order = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
        }
      },
      metodoPago: true,
      direccion: true,
      items: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              sku: true,
              precio: true,
              imagenes: true,
              marca: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  const serializedOrder = {
    ...order,
    subtotal: order.subtotal.toNumber(),
    impuestos: order.impuestos.toNumber(),
    costoEnvio: order.costoEnvio.toNumber(),
    total: order.total.toNumber(),
    creadoEl: order.creadoEl.toISOString(),
    actualizadoEl: order.actualizadoEl.toISOString(),
    metodoPago: order.metodoPago ? {
      ...order.metodoPago,
      creadoEl: order.metodoPago.creadoEl.toISOString(),
      actualizadoEl: order.metodoPago.actualizadoEl.toISOString()
    } : null,
    items: order.items.map(item => ({
      ...item,
      precioUnit: item.precioUnit.toNumber(),
      subtotal: item.subtotal.toNumber(),
      creadoEl: item.creadoEl.toISOString(),
      producto: {
        ...item.producto,
        precio: item.producto.precio.toNumber()
      }
    }))
  }

  return <OrderDetails initialOrder={serializedOrder} orderId={id} />
} 