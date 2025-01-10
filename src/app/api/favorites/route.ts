import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

// Obtener favoritos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const favoritos = await prisma.favorito.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        producto: {
          select: {
            nombre: true,
            precio: true,
            imagenes: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json(favoritos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener favoritos', details: error },
      { status: 500 }
    )
  }
}

// Agregar/Quitar favorito
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { productoId } = await request.json()

    const existingFavorito = await prisma.favorito.findUnique({
      where: {
        userId_productoId: {
          userId: session.user.id,
          productoId
        }
      }
    })

    if (existingFavorito) {
      await prisma.favorito.delete({
        where: {
          id: existingFavorito.id
        }
      })
      return NextResponse.json({ 
        message: 'Eliminado de favoritos',
        action: 'removed' 
      })
    }

    const favorito = await prisma.favorito.create({
      data: {
        userId: session.user.id,
        productoId
      }
    })

    return NextResponse.json({ 
      message: 'Agregado a favoritos',
      action: 'added',
      favorito 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar favoritos', details: error },
      { status: 500 }
    )
  }
} 