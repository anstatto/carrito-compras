import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true,
          }
        },
        items: {
          include: {
            producto: true
          }
        }
      }
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario tenga acceso al pedido
    if (session.user.role !== 'ADMIN' && pedido.clienteId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    return NextResponse.json(
      { error: 'Error al obtener el pedido' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { estado } = body

    // Solo admins pueden cambiar el estado
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para cambiar el estado' },
        { status: 401 }
      )
    }

    const pedido = await prisma.pedido.update({
      where: { id: params.id },
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