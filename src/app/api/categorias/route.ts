import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import slugify from 'slugify'

// GET - Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: {
        nombre: 'asc'
      }
    })
    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva categoría
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { nombre, descripcion, imagen } = body

    const slug = slugify(nombre, { lower: true })

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        descripcion,
        imagen,
        slug
      }
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error al crear categoría:', error)
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    )
  }
} 