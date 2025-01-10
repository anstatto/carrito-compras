import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import slugify from 'slugify'

interface CategoryCache {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  slug: string
  activa: boolean
}

// Implementar caché
let categoriesCache: CategoryCache[] | null = null
let lastFetch = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

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
    // Verificar caché
    if (categoriesCache && Date.now() - lastFetch < CACHE_DURATION) {
      return NextResponse.json(categoriesCache)
    }

    const categories = await prisma.categoria.findMany({
      where: { activa: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        imagen: true,
        slug: true,
        activa: true
      },
      orderBy: { nombre: 'asc' }
    })

    // Actualizar caché
    categoriesCache = categories
    lastFetch = Date.now()

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
} 