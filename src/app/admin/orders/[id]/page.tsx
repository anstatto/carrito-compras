import { prisma } from '@/lib/prisma'
import OrderDetails from './_components/OrderDetails'
import { notFound } from 'next/navigation'
import type { Order, Cliente } from '@/interfaces/Order'
import { Pedido, TipoPago, ProvinciaRD, AgenciaEnvio } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface Props {
  params: Promise<{
    id: string
  }>
}

interface UnprocessedOrder extends Omit<Pedido, 'subtotal' | 'impuestos' | 'costoEnvio' | 'total'> {
  subtotal: Decimal
  impuestos: Decimal
  costoEnvio: Decimal
  total: Decimal
  cliente: Cliente
  direccion: {
    calle: string
    numero: string
    sector: string
    provincia: ProvinciaRD
    municipio: string
    codigoPostal: string | null
    referencia: string | null
    telefono: string
    agenciaEnvio: AgenciaEnvio | null
    sucursalAgencia: string | null
  }
  metodoPago?: {
    tipo: TipoPago
  } | null
  items: Array<UnprocessedOrderItem>
}

interface UnprocessedOrderItem {
  id: string
  cantidad: number
  precioUnit: Decimal
  subtotal: Decimal
  precioRegular: Decimal | null
  precioOferta: Decimal | null
  porcentajeDescuento: number | null
  producto: {
    id: string
    nombre: string
    sku: string
    precio: Decimal
    precioOferta: Decimal | null
    marca: string
    imagenes?: Array<{ url: string }>
    enOferta: boolean
  }
}

function serializeOrderData(order: UnprocessedOrder): Order {
  return {
    id: order.id,
    numero: order.numero,
    clienteId: order.clienteId,
    cliente: order.cliente,
    direccion: order.direccion,
    subtotal: Number(order.subtotal),
    impuestos: Number(order.impuestos),
    costoEnvio: Number(order.costoEnvio),
    total: Number(order.total),
    estado: order.estado,
    estadoPago: order.estadoPago,
    metodoPago: order.metodoPago ? {
      tipo: order.metodoPago.tipo
    } : null,
    items: order.items.map((item: UnprocessedOrderItem) => ({
      id: item.id,
      cantidad: item.cantidad,
      precioUnit: Number(item.precioUnit),
      subtotal: Number(item.subtotal),
      precioRegular: item.precioRegular ? Number(item.precioRegular) : null,
      precioOferta: item.precioOferta ? Number(item.precioOferta) : null,
      porcentajeDescuento: item.porcentajeDescuento,
      enOferta: item.producto.enOferta,
      producto: {
        id: item.producto.id,
        nombre: item.producto.nombre,
        sku: item.producto.sku,
        precio: Number(item.producto.precio),
        marca: item.producto.marca,
        imagenes: item.producto.imagenes,
        precioOferta: item.producto.precioOferta ? Number(item.producto.precioOferta) : null
      }
    })),
    creadoEl: order.creadoEl ? new Date(order.creadoEl) : null,
    actualizadoEl: order.actualizadoEl ? new Date(order.actualizadoEl) : null
  }
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
              marca: true,
              enOferta: true,
              precioOferta: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  const serializedOrder = serializeOrderData(order)
  return <OrderDetails initialOrder={serializedOrder as Order} orderId={id} />
} 