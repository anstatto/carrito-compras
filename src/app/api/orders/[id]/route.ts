import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de orden no proporcionado' },
        { status: 400 }
      )
    }

    const order = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: {
          include: {
            producto: true
          }
        },
        direccion: true,
        metodoPago: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Retornar datos JSON
    const orderData = {
      ...order,
      subtotal: order.subtotal.toNumber(),
      impuestos: order.impuestos.toNumber(),
      costoEnvio: order.costoEnvio.toNumber(),
      total: order.total.toNumber(),
      items: order.items.map(item => ({
        ...item,
        precioUnit: item.precioUnit.toNumber(),
        subtotal: item.subtotal.toNumber(),
        producto: {
          ...item.producto,
          precio: item.producto.precio.toNumber()
        }
      }))
    }

    return NextResponse.json(orderData)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los datos de la orden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de orden no proporcionado' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { estado } = body

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para cambiar el estado' },
        { status: 401 }
      )
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { 
        estado,
        actualizadoEl: new Date()
      }
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
} 