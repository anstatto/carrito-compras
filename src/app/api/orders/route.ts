import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { Prisma, TipoPago, EstadoPedido, ProvinciaRD, AgenciaEnvio } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Interfaces para la creación de pedidos manuales
interface ManualOrderItem {
  id: string;
  cantidad: number;
}

interface ManualOrderData {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  calle: string;
  numero: string;
  sector: string;
  provincia: ProvinciaRD;
  municipio: string;
  referencia?: string;
  telefono: string;
  celular?: string;
  agenciaEnvio?: AgenciaEnvio;
  sucursalAgencia?: string;
  esManual: boolean;
  productos: ManualOrderItem[];
  metodoPago: TipoPago;
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

    if (!session?.user?.id || (session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json() as ManualOrderData
    
    // Crear dirección manual
    const direccion = await prisma.direccion.create({
      data: {
        calle: body.calle,
        numero: body.numero,
        sector: body.sector,
        provincia: body.provincia,
        municipio: body.municipio,
        referencia: body.referencia,
        telefono: body.telefono,
        celular: body.celular,
        agenciaEnvio: body.agenciaEnvio,
        sucursalAgencia: body.sucursalAgencia,
        esManual: true
      }
    })

    // Calcular siguiente número de pedido
    const ultimoPedido = await prisma.pedido.findFirst({
      orderBy: { numero: 'desc' }
    })

    const numeroActual = ultimoPedido 
      ? parseInt(ultimoPedido.numero.replace('PED', ''))
      : 0
    const nuevoNumero = `PED${(numeroActual + 1).toString().padStart(6, '0')}`

    // Crear el pedido
    const pedido = await prisma.pedido.create({
      data: {
        numero: nuevoNumero,
        nombreCliente: body.nombreCliente,
        emailCliente: body.emailCliente,
        telefonoCliente: body.telefonoCliente,
        esManual: true,
        estado: "PENDIENTE",
        estadoPago: "PENDIENTE",
        direccionId: direccion.id,
        items: {
          create: await Promise.all(body.productos.map(async (item) => {
            const producto = await prisma.producto.findUnique({
              where: { id: item.id }
            })

            if (!producto) {
              throw new Error(`Producto no encontrado: ${item.id}`)
            }

            const precioFinal = producto.enOferta && producto.precioOferta 
              ? producto.precioOferta.toNumber()
              : producto.precio.toNumber()

            return {
              productoId: item.id,
              cantidad: item.cantidad,
              precioUnit: new Prisma.Decimal(precioFinal),
              subtotal: new Prisma.Decimal(precioFinal * item.cantidad),
              enOferta: producto.enOferta,
              precioRegular: producto.precio,
              precioOferta: producto.precioOferta,
              porcentajeDescuento: producto.enOferta && producto.precioOferta
                ? Math.round(((producto.precio.toNumber() - producto.precioOferta.toNumber()) / producto.precio.toNumber()) * 100)
                : null
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            producto: true
          }
        }
      }
    })

    // Calcular totales
    const subtotal = pedido.items.reduce((acc, item) => acc + item.subtotal.toNumber(), 0)
    const impuestos = 0 // Configurar según necesidad
    const costoEnvio = 0 // Configurar según necesidad
    const total = subtotal + impuestos + costoEnvio

    // Actualizar totales
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        impuestos: new Prisma.Decimal(impuestos),
        costoEnvio: new Prisma.Decimal(costoEnvio),
        total: new Prisma.Decimal(total)
      }
    })

    // Actualizar inventario
    for (const item of pedido.items) {
      await prisma.producto.update({
        where: { id: item.productoId },
        data: {
          existencias: {
            decrement: item.cantidad
          }
        }
      })

      await prisma.movimientoInventario.create({
        data: {
          productoId: item.productoId,
          tipo: "SALIDA",
          cantidad: item.cantidad,
          nota: `Venta manual - Pedido ${pedido.numero}`,
          userId: session.user.id
        }
      })
    }

    revalidatePath('/admin/orders')
    
    return NextResponse.json({ 
      success: true, 
      data: serializeOrder(pedido) 
    })
  } catch (error) {
    console.error('Error al crear pedido manual:', error)
    return NextResponse.json(
      { success: false, error: "Error al crear el pedido" },
      { status: 500 }
    )
  }
}
