import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const productosDestacados = await prisma.producto.findMany({
      where: {
        activo: true,
        destacado: true,
        existencias: {
          gt: 0
        }
      },
      include: {
        categoria: true,
        imagenes: {
          orderBy: {
            orden: 'asc'
          }
        }
      },
      take: 8,
      orderBy: {
        creadoEl: 'desc'
      }
    })
    
    return NextResponse.json(productosDestacados)
  } catch (error) {
    console.error('Error al obtener productos destacados:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos destacados' },
      { status: 500 }
    )
  }
} 