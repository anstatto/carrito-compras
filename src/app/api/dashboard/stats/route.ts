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

    const [totalPedidos, totalUsuarios, totalProductos, ventasTotal] = await Promise.all([
      prisma.pedido.count(),
      prisma.user.count(),
      prisma.producto.count(),
      prisma.pedido.aggregate({
        _sum: {
          total: true
        },
        where: {
          estado: {
            in: ['PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']
          }
        }
      })
    ])

    return NextResponse.json({
      totalPedidos,
      totalUsuarios,
      totalProductos,
      ventasTotal: Number(ventasTotal._sum.total || 0)
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
} 