import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const producto = await prisma.producto.findUnique({
      where: {
        id: params.id
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    })
    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    if (!body.nombre || !body.precio) {
      return NextResponse.json(
        { error: 'Nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    const producto = await prisma.producto.update({
      where: {
        id: params.id
      },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        precio: body.precio,
        categoria: body.categoria,
        existencias: body.existencias,
        imagenes: body.imagenes
      }
    })

    return NextResponse.json(producto)
  } catch (error: unknown) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'ID de producto es requerido' },
        { status: 400 }
      )
    }

    await prisma.producto.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}