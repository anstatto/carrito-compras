import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import slugify from 'slugify'

// Definir interfaz para el tipo de caché
interface CategoriaCache {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  slug: string
  activa: boolean
  _count: { productos: number }
}

// Actualizar tipo del caché
let categoriesCache: CategoriaCache[] | null = null
let lastFetch = 0
const CACHE_DURATION = 1000 * 60 * 5 // 5 minutos

// GET - Obtener todas las categorías
export async function GET() {
  try {
    // Verificar caché
    if (categoriesCache && Date.now() - lastFetch < CACHE_DURATION) {
      return NextResponse.json(categoriesCache)
    }

    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        imagen: true,
        slug: true,
        activa: true,
        creadoEl: true,
        actualizadoEl: true,
        _count: {
          select: { productos: true }
        }
      }
    })

    // Actualizar caché
    categoriesCache = categorias
    lastFetch = Date.now()

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