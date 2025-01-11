import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Esquema de validación mejorado con mensajes personalizados
const cartItemSchema = z.object({
  productoId: z.string().min(1, 'El ID del producto es requerido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0')
})

// Función auxiliar para crear respuestas JSON consistentes
const createResponse = (success: boolean, data?: Record<string, unknown>, error?: string, status = 200) => {
  return NextResponse.json(
    { success, ...(data !== undefined && { data }), ...(error && { error }) },
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.activo) {
      return createResponse(false, undefined, 'No autorizado o usuario inactivo', 401)
    }

    const body = await request.json()
    const validationResult = cartItemSchema.safeParse(body)

    if (!validationResult.success) {
      return createResponse(false, undefined, 'Datos inválidos', 400)
    }

    const { productoId, cantidad } = validationResult.data

    const producto = await prisma.producto.findUnique({
      where: { 
        id: productoId,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        precio: true,
        precioOferta: true,
        marca: true,
        existencias: true,
        limitePorCompra: true,
        imagenes: {
          take: 1,
          select: { url: true }
        }
      }
    })

    if (!producto) {
      return createResponse(false, undefined, 'Producto no encontrado o inactivo', 404)
    }

    if (producto.existencias < cantidad) {
      return createResponse(false, undefined, `Stock insuficiente. Disponible: ${producto.existencias}`, 400)
    }

    if (producto.limitePorCompra && cantidad > producto.limitePorCompra) {
      return createResponse(false, undefined, `Límite de compra: ${producto.limitePorCompra} unidades`, 400)
    }

    const precioFinal = Number(producto.precioOferta || producto.precio)

    const carritoItem = await prisma.carritoItem.upsert({
      where: {
        userId_productoId: {
          userId: session.user.id,
          productoId: producto.id
        }
      },
      create: {
        userId: session.user.id,
        productoId: producto.id,
        cantidad,
        precioUnitario: precioFinal,
        subtotal: precioFinal * cantidad
      },
      update: {
        cantidad,
        precioUnitario: precioFinal,
        subtotal: precioFinal * cantidad
      }
    })

    return createResponse(true, {
      id: carritoItem.id,
      productoId: carritoItem.productoId,
      cantidad: carritoItem.cantidad,
      nombre: producto.nombre,
      precio: precioFinal,
      marca: producto.marca,
      imagen: producto.imagenes[0]?.url || '/images/placeholder.png',
      existencias: producto.existencias
    })

  } catch (error) {
    console.error('Error en POST /api/cart:', error)
    return createResponse(false, undefined, 'Error interno del servidor', 500)
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return createResponse(false, undefined, 'No autorizado', 401)
    }

    const carritoItems = await prisma.carritoItem.findMany({
      where: { userId: session.user.id },
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

    return createResponse(true, { items: carritoItems })

  } catch (error) {
    console.error('Error en GET /api/cart:', error)
    return createResponse(false, undefined, 'Error al obtener el carrito', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createResponse(false, undefined, 'No autorizado', 401)
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return createResponse(false, undefined, 'ID de item requerido', 400)
    }

    const item = await prisma.carritoItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id
      }
    })

    if (!item) {
      return createResponse(false, undefined, 'Item no encontrado', 404)
    }

    await prisma.carritoItem.delete({
      where: {
        id: itemId,
        userId: session.user.id
      }
    })

    return createResponse(true, undefined, 'Item eliminado correctamente')

  } catch (error) {
    console.error('Error en DELETE /api/cart:', error)
    return createResponse(false, undefined, 'Error al eliminar item', 500)
  }
}