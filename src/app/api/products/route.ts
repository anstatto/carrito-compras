import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { Decimal } from "@prisma/client/runtime/library"

interface ProductCache {
  id: string
  nombre: string
  precio: Decimal
  existencias: number
  imagenes: { url: string; alt: string | null }[]
  categoria: { 
    id: string
    nombre: string 
  }
  enOferta: boolean
  precioOferta: Decimal | null
}

interface CacheEntry {
  data: ProductCache[]
  timestamp: number
}

const productsCache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Función auxiliar para validar el caché
const isCacheValid = (cacheKey: string): boolean => {
  const entry = productsCache[cacheKey]
  return entry && (Date.now() - entry.timestamp) < CACHE_DURATION
}

interface ProductImage {
  url: string;
  alt?: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const cacheKey = searchParams.toString()

    // Verificar caché mejorado
    if (isCacheValid(cacheKey)) {
      return NextResponse.json(productsCache[cacheKey].data)
    }

    // Construir el query de manera más eficiente
    const baseWhere: Prisma.ProductoWhereInput = {
      ...((!isAdmin) && { activo: true }),
      ...(searchParams.get('destacado') === 'true' && { destacado: true }),
      ...(searchParams.get('categoria') && { 
        categoriaId: {
          equals: searchParams.get('categoria') || undefined
        }
      })
    }

    // Añadir filtros de precio de manera más eficiente
    const precioMin = searchParams.get('precioMin')
    const precioMax = searchParams.get('precioMax')
    if (precioMin || precioMax) {
      baseWhere.precio = {
        ...(precioMin && { gte: new Prisma.Decimal(precioMin) }),
        ...(precioMax && { lte: new Prisma.Decimal(precioMax) })
      }
    }

    // Búsqueda optimizada
    const searchTerm = searchParams.get('buscar')
    if (searchTerm) {
      baseWhere.OR = [
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { descripcion: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    const productos = await prisma.producto.findMany({
      where: baseWhere,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        existencias: true,
        enOferta: true,
        precioOferta: true,
        destacado: true,
        activo: true,
        stockMinimo: true,
        sku: true,
        imagenes: {
          take: 1,
          select: {
            url: true,
            alt: true
          },
          orderBy: {
            orden: 'asc'
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        creadoEl: 'desc'
      },
      take: 20,
      skip: Number(searchParams.get('page') || 0) * 20
    })

    // Procesar URLs de imágenes
    const processedProducts = productos.map(producto => ({
      ...producto,
      imagenes: producto.imagenes.map(img => ({
        ...img,
        url: `/productos/${img.url.split('/').pop()}`
      }))
    }))

    productsCache[cacheKey] = {
      data: processedProducts,
      timestamp: Date.now()
    }

    return NextResponse.json(processedProducts)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const data = await request.json()
    
    // Validar datos requeridos
    if (!data.nombre || !data.precio || !data.categoriaId) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    const product = await prisma.$transaction(async (tx) => {
      // Crear el producto
      const newProduct = await tx.producto.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: new Prisma.Decimal(data.precio),
          existencias: data.existencias,
          stockMinimo: data.stockMinimo,
          categoriaId: data.categoriaId,
          activo: data.activo,
          enOferta: data.enOferta,
          precioOferta: data.precioOferta 
            ? new Prisma.Decimal(data.precioOferta) 
            : null,
          destacado: data.destacado,
          marca: data.marca || 'GENERICO',
          slug: data.slug || data.nombre.toLowerCase().replace(/ /g, '-'),
          sku: data.sku || `SKU-${Date.now()}`
        }
      })

      // Crear imágenes si existen
      if (data.imagenes?.length > 0) {
        await tx.image.createMany({
          data: data.imagenes.map((img: ProductImage, index: number) => ({
            url: img.url,
            alt: img.alt || newProduct.nombre,
            principal: index === 0,
            orden: index,
            productoId: newProduct.id
          }))
        })
      }

      return tx.producto.findUnique({
        where: { id: newProduct.id },
        include: {
          categoria: true,
          imagenes: true
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al crear el producto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Mejorar la limpieza del caché
const cleanCache = () => {
  const now = Date.now()
  Object.keys(productsCache).forEach(key => {
    if (now - productsCache[key].timestamp > CACHE_DURATION) {
      delete productsCache[key]
    }
  })
}

// Ejecutar limpieza cada minuto
setInterval(cleanCache, 60 * 1000)
