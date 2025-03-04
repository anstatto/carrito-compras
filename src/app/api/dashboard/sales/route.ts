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

    // Obtener ventas de los últimos 12 meses
    const lastYear = new Date()
    lastYear.setMonth(lastYear.getMonth() - 11)

    const monthlySales = await prisma.pedido.groupBy({
      by: ['creadoEl'],
      _count: {
        id: true
      },
      _sum: {
        total: true
      },
      where: {
        creadoEl: {
          gte: lastYear
        },
        estado: {
          not: 'CANCELADO'
        }
      }
    })

    // Procesar los datos para el formato del gráfico
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    const salesByMonth = new Array(12).fill(null).map((_, index) => {
      const month = new Date()
      month.setMonth(month.getMonth() - (11 - index))
      
      const monthData = monthlySales.find(sale => {
        const saleMonth = new Date(sale.creadoEl).getMonth()
        const saleYear = new Date(sale.creadoEl).getFullYear()
        return saleMonth === month.getMonth() && saleYear === month.getFullYear()
      })

      return {
        month: months[month.getMonth()],
        total: monthData?._sum.total || 0,
        orders: monthData?._count.id || 0
      }
    })

    return NextResponse.json(salesByMonth)
  } catch (error) {
    console.error('Error al obtener datos de ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de ventas' },
      { status: 500 }
    )
  }
} 