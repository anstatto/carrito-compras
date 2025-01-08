import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const pedidos = await prisma.pedido.findMany({
      where: session.user.role === 'ADMIN' 
        ? undefined 
        : { clienteId: session.user.id },
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true,
          }
        },
        items: {
          include: {
            producto: {
              select: {
                nombre: true,
                imagenes: {
                  take: 1,
                  select: {
                    url: true
                  }
                }
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
        metodoPago,
        direccion,
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