import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validación
const cartItemSchema = z.object({
  productoId: z.string(),
  cantidad: z.number().int().positive()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'No autorizado' 
      }, { status: 401 })
    }

    console.log('Session user:', session.user)

    // Verificar usuario fuera de la transacción
    const userExists = await prisma.user.findUnique({
      where: { 
        id: session.user.id,
      },
      select: { id: true, activo: true }
    })

    if (!userExists) {
      console.log('Usuario no existe:', session.user.id)
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      }, { status: 401 })
    }

    if (!userExists.activo) {
      console.log('Usuario inactivo:', session.user.id)
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario inactivo' 
      }, { status: 403 })
    }

    let body
    try {
      body = await request.json()
      console.log('Body recibido:', body)
    } catch (e) {
      console.log('Error al parsear body:', e)
      return NextResponse.json({ 
        success: false, 
        error: 'Datos inválidos' 
      }, { status: 400 })
    }

    const validationResult = cartItemSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Datos inválidos',
        details: validationResult.error.issues 
      }, { status: 400 })
    }

    const { productoId, cantidad } = validationResult.data

    const result = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: productoId },
        select: {
          id: true,
          nombre: true,
          precio: true,
          marca: true,
          existencias: true,
          imagenes: {
            take: 1,
            select: { url: true }
          }
        }
      })

      if (!producto) {
        throw new Error('Producto no encontrado')
      }

      if (producto.existencias < cantidad) {
        throw new Error(`Solo hay ${producto.existencias} unidades disponibles`)
      }

      const carritoItem = await tx.carritoItem.upsert({
        where: {
          userId_productoId: {
            userId: session.user.id,
            productoId: producto.id
          }
        },
        create: {
          userId: session.user.id,
          productoId: producto.id,
          cantidad
        },
        update: {
          cantidad: { increment: cantidad }
        }
      })

      return {
        id: carritoItem.id,
        productoId: carritoItem.productoId,
        cantidad: carritoItem.cantidad,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        marca: producto.marca,
        imagen: producto.imagenes[0]?.url || '/images/placeholder.png'
      }
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    console.log('Error en POST /api/cart:', errorMessage)
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: error instanceof Error ? 400 : 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const carritoItems = await prisma.carritoItem.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        producto: {
          select: {
            nombre: true,
            precio: true,
            marca: true,
            existencias: true,
            imagenes: {
              take: 1,
              select: { url: true }
            }
          }
        }
      }
    })

    return NextResponse.json(carritoItems)
  } catch (error) {
    console.error('Error en GET /api/cart:', error)
    return NextResponse.json({ error: 'Error al obtener el carrito' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'ID de item requerido' }, { status: 400 })
    }

    await prisma.carritoItem.delete({
      where: {
        id: itemId,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/cart:', error)
    return NextResponse.json({ error: 'Error al eliminar item' }, { status: 500 })
  }
} 