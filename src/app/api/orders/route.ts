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
  enOferta?: boolean;
  precioOferta?: Prisma.Decimal | null;
}

interface ProcessedOrderItem {
  productoId: string;
  cantidad: number;
  precioUnit: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  enOferta: boolean;
  precioRegular: Prisma.Decimal;
  precioOferta: Prisma.Decimal | null;
  porcentajeDescuento: number | null;
}

interface CreateOrderData {
  clienteId: string;
  items: OrderItem[];
  metodoPago: TipoPago;
  total: number;
}

interface SerializedOrder {
  items?: Array<{
    producto: {
      imagenes?: Array<{
        id: string;
        url: string;
        [key: string]: unknown;
      }>;
      precioOferta: Prisma.Decimal | null;
      [key: string]: unknown;
    };
    precioUnit: Prisma.Decimal;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

function serializeOrder(order: SerializedOrder) {
  return {
    ...order,
    items: order.items?.map((item) => ({
      ...item,
      precioUnit: Number(item.precioUnit),
      subtotal: Number(item.subtotal),
      precioRegular: Number(item.precioRegular),
      precioOferta: item.precioOferta ? Number(item.precioOferta) : null,
      producto: {
        ...item.producto,
        precio: Number(item.producto.precio),
        precioOferta: item.producto.precioOferta ? Number(item.producto.precioOferta) : null
      }
    }))
  };
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
      orders: pedidos.map(pedido => serializeOrder(pedido)),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
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
    if (!body) {
      return NextResponse.json(
        { error: 'El cuerpo de la solicitud está vacío' },
        { status: 400 }
      )
    }

    const { clienteId, items, metodoPago, total } = body

    // Validaciones
    if (!clienteId || !items?.length || !metodoPago || typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { error: 'Datos de pedido incompletos o inválidos' },
        { status: 400 }
      )
    }

    // Verificar dirección predeterminada
    const direccion = await prisma.direccion.findFirst({
      where: {
        userId: clienteId,
        predeterminada: true
      }
    })

    if (!direccion) {
      return NextResponse.json(
        { error: 'El cliente no tiene una dirección predeterminada' },
        { status: 400 }
      )
    }

    // Procesar items y verificar existencias
    const itemsProcesados: ProcessedOrderItem[] = []
    let subtotalTotal = new Prisma.Decimal(0)
    
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

      // Calcular precios y descuentos
      const precioRegular = producto.precio
      const precioUnitario = producto.enOferta && producto.precioOferta 
        ? producto.precioOferta 
        : producto.precio

      const subtotal = new Prisma.Decimal(Number(precioUnitario) * item.cantidad)
      subtotalTotal = subtotalTotal.add(subtotal)

      const porcentajeDescuento = producto.enOferta && producto.precioOferta
        ? Math.round((1 - (Number(producto.precioOferta) / Number(producto.precio))) * 100)
        : null

      itemsProcesados.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnit: precioUnitario,
        subtotal: subtotal,
        enOferta: producto.enOferta,
        precioRegular: precioRegular,
        precioOferta: producto.precioOferta,
        porcentajeDescuento
      })
    }

    // Verificar total
    if (!subtotalTotal.equals(new Prisma.Decimal(total))) {
      return NextResponse.json(
        { error: 'El total no coincide con los precios de los productos' },
        { status: 400 }
      )
    }

    // Crear pedido en una transacción
    const pedido = await prisma.$transaction(async (prisma) => {
      // Crear método de pago
      const metodoPagoCreado = await prisma.metodoPago.create({
        data: {
          tipo: metodoPago,
          userId: clienteId,
        }
      })

      // Crear el pedido
      const nuevoPedido = await prisma.pedido.create({
        data: {
          numero: `PED-${Date.now()}`,
          clienteId,
          direccionId: direccion.id,
          metodoPagoId: metodoPagoCreado.id,
          estado: 'PENDIENTE',
          estadoPago: 'PENDIENTE',
          total: subtotalTotal,
          items: {
            create: itemsProcesados
          }
        },
        include: {
          items: {
            include: {
              producto: {
                include: {
                  imagenes: true
                }
              }
            }
          },
          cliente: true,
          direccion: true,
          metodoPago: true
        }
      })

      // Actualizar existencias
      for (const item of itemsProcesados) {
        await prisma.producto.update({
          where: { id: item.productoId },
          data: { 
            existencias: {
              decrement: item.cantidad
            }
          }
        })
      }

      return nuevoPedido
    })

    return NextResponse.json({ 
      success: true, 
      data: serializeOrder(pedido)
    })

  } catch (error) {
    console.error('Error al crear pedido:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el pedido'
      },
      { status: 500 }
    )
  }
}
