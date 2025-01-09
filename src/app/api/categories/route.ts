import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import slugify from 'slugify'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, descripcion, imagen, activa } = body

    // Generar el slug a partir del nombre
    const slug = slugify(nombre, { lower: true })

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        descripcion,
        imagen,
        slug,
        activa: activa ?? true
      }
    })
    
    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        productos: true
      },
      orderBy: {
        nombre: 'asc'
      }
    })
    
    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    )
  }
} 