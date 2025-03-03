import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { Prisma, TipoPago, EstadoPedido } from "@prisma/client"



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

interface ProductoActualizado {
  id: string;
  existencias: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const estado = searchParams.get('estado') as EstadoPedido | null
    const busqueda = searchParams.get('busqueda')
    const fechaInicio = searchParams.get('fechaInicio') || new Date().toISOString().split('T')[0]
    const fechaFin = searchParams.get('fechaFin') || new Date().toISOString().split('T')[0]
    const metodoPago = searchParams.get('metodoPago') as TipoPago | null

    const where: Prisma.PedidoWhereInput = {
      ...(estado && { estado }),
      ...(metodoPago && {
        metodoPago: {
          tipo: metodoPago
        }
      }),
      creadoEl: {
        gte: new Date(`${fechaInicio}T00:00:00Z`),
        lte: new Date(`${fechaFin}T23:59:59Z`),
      },
      ...(busqueda && {
        OR: [
          { numero: { contains: busqueda, mode: Prisma.QueryMode.insensitive } },
          { 
            cliente: {
              OR: [
                { nombre: { contains: busqueda, mode: Prisma.QueryMode.insensitive } },
                { apellido: { contains: busqueda, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: busqueda, mode: Prisma.QueryMode.insensitive } }
              ]
            }
          }
        ]
      })
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { creadoEl: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          },
          metodoPago: true
        }
      }),
      prisma.pedido.count({ where })
    ])

    return NextResponse.json({
      orders: pedidos,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
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
    //console.log('Datos recibidos:', body)

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

    //console.log('Dirección encontrada:', direccion)

    if (!direccion) {
      return NextResponse.json(
        { error: 'El cliente no tiene una dirección predeterminada' },
        { status: 400 }
      )
    }

    // Verificar productos y actualizar existencias
    const productosActualizados: ProductoActualizado[] = []
    
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

      productosActualizados.push({
        id: producto.id,
        existencias: producto.existencias - item.cantidad
      })
    }

    // Crear método de pago
    const metodoPagoCreado = await prisma.metodoPago.create({
      data: {
        tipo: metodoPago,
        userId: clienteId,
      }
    });

    // Crear el pedido y actualizar existencias en una transacción
    const pedido = await prisma.$transaction(async (prisma) => {
      // Crear el pedido
      const nuevoPedido = await prisma.pedido.create({
        data: {
          numero: `PED-${Date.now()}`,
          clienteId,
          direccionId: direccion.id,
          metodoPagoId: metodoPagoCreado.id,
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
          direccion: true,
          metodoPago: true
        }
      })

      // Actualizar existencias de productos
      for (const producto of productosActualizados) {
        await prisma.producto.update({
          where: { id: producto.id },
          data: { existencias: producto.existencias }
        })
      }

      return nuevoPedido
    })

    return NextResponse.json({ 
      success: true, 
      data: pedido 
    })

  } catch (error) {
    console.error('Error detallado al crear pedido:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el pedido'
      },
      { status: 500 }
    )
  }
}
