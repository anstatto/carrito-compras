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

    // Obtener ventas de los últimos 7 días
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 6)

    const sales = await prisma.pedido.groupBy({
      by: ['creadoEl'],
      _sum: {
        total: true
      },
      where: {
        creadoEl: {
          gte: startDate,
          lte: endDate
        },
        estado: {
          in: ['PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']
        }
      }
    })

    // Formatear datos para el gráfico
    const labels = []
    const data = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - i)
      const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'short' })
      
      const saleForDay = sales.find(s => 
        new Date(s.creadoEl).toDateString() === date.toDateString()
      )
      
      labels.unshift(formattedDate)
      data.unshift(Number(saleForDay?._sum.total || 0))
    }

    return NextResponse.json({ labels, data })
  } catch (error) {
    console.error('Error al obtener datos de ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de ventas' },
      { status: 500 }
    )
  }
} 