import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { EstadoPedido, TipoPago } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

// Definir interfaz para el tipo de caché
interface OrderCache {
  id: string
  numero: string
  total: Decimal
  estado: EstadoPedido
  creadoEl: Date
  metodoPago: { tipo: TipoPago } | null
  cliente: { nombre: string; email: string }
}

// Actualizar tipo del caché
let ordersCache: OrderCache[] | null = null
let lastFetch = 0
const CACHE_DURATION = 1000 * 60 * 5 // 5 minutos

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    // Obtener los parámetros de búsqueda y convertir a tipos apropiados
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const estado = searchParams.get('estado') || undefined // Filtro por estado
    const metodoPago = searchParams.get('metodoPago') || undefined // Filtro por tipo de pago
    const clienteNombre = searchParams.get('clienteNombre') || undefined // Filtro por nombre de cliente
    const clienteEmail = searchParams.get('clienteEmail') || undefined // Filtro por email de cliente
    const fechaDesde = searchParams.get('fechaDesde') ? new Date(searchParams.get('fechaDesde')!) : undefined // Filtro por fecha desde
    const fechaHasta = searchParams.get('fechaHasta') ? new Date(searchParams.get('fechaHasta')!) : undefined // Filtro por fecha hasta

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar caché para admins
    if (session.user.role === 'ADMIN' && ordersCache && Date.now() - lastFetch < CACHE_DURATION) {
      return NextResponse.json(ordersCache)
    }

    // Construir filtros dinámicamente
    const filtros: Record<string, unknown> = {
      ...(estado && { estado }),
      ...(metodoPago && { metodoPagoId: metodoPago }),
      ...(clienteNombre && { cliente: { nombre: { contains: clienteNombre, mode: 'insensitive' } } }),
      ...(clienteEmail && { cliente: { email: { contains: clienteEmail, mode: 'insensitive' } } }),
      ...(fechaDesde && { creadoEl: { gte: fechaDesde } }),
      ...(fechaHasta && { creadoEl: { lte: fechaHasta } })
    }

    const pedidos = await prisma.pedido.findMany({
      where: session.user.role === 'ADMIN'
        ? filtros
        : { clienteId: session.user.id, ...filtros },
      select: {
        id: true,
        numero: true,
        total: true,
        estado: true,
        creadoEl: true,
        cliente: {
          select: {
            nombre: true,
            email: true,
          }
        },
        metodoPago: {
          select: {
            tipo: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                nombre: true,
                imagenes: true
              }
            }
          }
        }
      },
      orderBy: {
        creadoEl: 'desc'
      },
      take: limit
    })

    // Actualizar caché para admins
    if (session.user.role === 'ADMIN') {
      ordersCache = pedidos
      lastFetch = Date.now()
    }

    return NextResponse.json(pedidos)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener los pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, direccion, metodoPago, notas } = body

    if (!items?.length) {
      return NextResponse.json(
        { error: 'El pedido debe contener al menos un producto' },
        { status: 400 }
      )
    }

    // Calcular total y validar productos
    let total = 0
    const itemsData = await Promise.all(items.map(async (item: { productoId: string, cantidad: number }) => {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId }
      })

      if (!producto || !producto.activo) {
        throw new Error(`Producto no disponible: ${item.productoId}`)
      }

      const subtotal = Number(producto.precio) * item.cantidad
      total += subtotal

      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnit: producto.precio,
        subtotal
      }
    }))

    // Crear el pedido con sus items
    const pedido = await prisma.pedido.create({
      data: {
        numero: `PED-${Date.now()}`,
        clienteId: session.user.id,
        total,
        estado: 'PENDIENTE',
        metodoPagoId: metodoPago,
        direccionId: direccion,
        notas,
        items: {
          create: itemsData
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al crear pedido:', error)
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    )
  }
}
