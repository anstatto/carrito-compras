import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const topProducts = await prisma.producto.findMany({
      select: {
        id: true,
        nombre: true,
        imagenes: {
          take: 1,
          select: {
            url: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        items: {
          _count: 'desc'
        }
      },
      take: 5
    })

    const formattedProducts = topProducts.map(product => ({
      id: product.id,
      nombre: product.nombre,
      ventas: product._count.items,
      imagen: product.imagenes[0]?.url
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos más vendidos' },
      { status: 500 }
    )
  }
} 