import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const topProducts = await prisma.itemPedido.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 5
    })

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.producto.findUnique({
          where: { id: item.productoId },
          include: {
            imagenes: {
              where: { principal: true },
              take: 1
            }
          }
        })

        return {
          id: product?.id,
          nombre: product?.nombre,
          ventas: item._sum.cantidad,
          imagen: product?.imagenes[0]?.url
        }
      })
    )

    return NextResponse.json(productsWithDetails)
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos más vendidos' },
      { status: 500 }
    )
  }
} 