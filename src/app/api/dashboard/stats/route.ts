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

    // Obtener fecha inicio del mes actual
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Estadísticas generales
    const [
      totalPedidos,
      pedidosPendientes,
      totalUsuarios,
      totalProductos,
      ventasTotal,
      ventasMes
    ] = await Promise.all([
      prisma.pedido.count(),
      prisma.pedido.count({
        where: { estado: 'PENDIENTE' }
      }),
      prisma.user.count(),
      prisma.producto.count(),
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: { 
          estado: { not: 'CANCELADO' }
        }
      }),
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: {
          estado: { not: 'CANCELADO' },
          creadoEl: { gte: startOfMonth }
        }
      })
    ])

    return NextResponse.json({
      totalPedidos,
      pedidosPendientes,
      totalUsuarios,
      totalProductos,
      ventasTotal: ventasTotal._sum.total || 0,
      ventasMes: ventasMes._sum.total || 0
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
} 