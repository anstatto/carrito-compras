import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { Prisma, EstadoPedido, TipoPago } from "@prisma/client"

interface OrderItem {
  productoId: string;
  cantidad: number;
  precioUnit: Prisma.Decimal | number | string;
  subtotal?: Prisma.Decimal;
}

interface CreateOrderData {
  clienteId: string;
  items: OrderItem[];
  metodoPago: TipoPago;
  total: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Filtros
    const estado = searchParams.get('estado')
    const metodoPago = searchParams.get('metodoPago')
    const clienteNombre = searchParams.get('clienteNombre')
    const fechaDesde = searchParams.get('fechaDesde')
    const fechaHasta = searchParams.get('fechaHasta')

    // Construir where clause
    const where: Prisma.PedidoWhereInput = {}
    
    if (estado) where.estado = estado as EstadoPedido
    if (metodoPago) where.metodoPagoId = metodoPago as TipoPago
    if (clienteNombre) {
      where.cliente = {
        nombre: {
          contains: clienteNombre,
          mode: 'insensitive'
        }
      }
    }
    if (fechaDesde || fechaHasta) {
      where.creadoEl = {
        ...(fechaDesde && { gte: new Date(fechaDesde) }),
        ...(fechaHasta && { lte: new Date(fechaHasta) })
      }
    }

    // Obtener total de registros para la paginación
    const total = await prisma.pedido.count({ where })

    // Obtener órdenes con filtros y paginación
    const orders = await prisma.pedido.findMany({
      where,
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true
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
      skip,
      take: limit
    })

    return NextResponse.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })

  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener las órdenes' },
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

    const body = await request.json() as CreateOrderData
    console.log('Datos recibidos:', body)

    const { clienteId, items, metodoPago, total } = body

    // Validaciones detalladas
    if (!clienteId) {
      return NextResponse.json({ error: 'clienteId es requerido' }, { status: 400 })
    }
    if (!items?.length) {
      return NextResponse.json({ error: 'Se requiere al menos un item' }, { status: 400 })
    }
    if (!metodoPago) {
      return NextResponse.json({ error: 'metodoPago es requerido' }, { status: 400 })
    }
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'total debe ser un número mayor a 0' }, { status: 400 })
    }

    // Verificar dirección
    const direccion = await prisma.direccion.findFirst({
      where: {
        userId: clienteId,
        predeterminada: true
      }
    })

    console.log('Dirección encontrada:', direccion)

    if (!direccion) {
      return NextResponse.json(
        { error: 'El cliente no tiene una dirección predeterminada' },
        { status: 400 }
      )
    }

    // Verificar productos
    for (const item of items) {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId }
      })

      if (!producto) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productoId}` },
          { status: 400 }
        )
      }

      if (producto.existencias < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para: ${producto.nombre}` },
          { status: 400 }
        )
      }
    }

    // Crear el pedido
    const pedido = await prisma.pedido.create({
      data: {
        numero: `PED-${Date.now()}`,
        clienteId,
        direccionId: direccion.id,
        metodoPagoId: metodoPago,
        estado: 'PENDIENTE',
        estadoPago: 'PENDIENTE',
        total: new Prisma.Decimal(total),
        items: {
          create: items.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnit: new Prisma.Decimal(item.precioUnit),
            subtotal: new Prisma.Decimal(Number(item.precioUnit) * item.cantidad)
          }))
        }
      },
      include: {
        items: {
          include: {
            producto: true
          }
        },
        cliente: true,
        direccion: true
      }
    })

    console.log('Pedido creado:', pedido)

    return NextResponse.json({ success: true, data: pedido })

  } catch (error) {
    console.error('Error detallado al crear pedido:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Error al crear el pedido' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
