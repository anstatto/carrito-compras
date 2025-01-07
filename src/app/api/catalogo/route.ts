import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

type OrderBy = {
  [key: string]: 'asc' | 'desc'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const categoria = searchParams.get('categoria')
    const precioMin = searchParams.get('precioMin')
    const precioMax = searchParams.get('precioMax')
    const ordenar = searchParams.get('ordenar') || 'nombre_asc'
    const pagina = Math.max(1, parseInt(searchParams.get('pagina') || '1'))
    const porPagina = Math.max(1, parseInt(searchParams.get('porPagina') || '12'))

    const where: Prisma.ProductoWhereInput = {
      activo: true,
      ...(categoria && { categoriaId: categoria }),
      ...(precioMin && { precio: { gte: new Prisma.Decimal(precioMin) } }),
      ...(precioMax && { precio: { lte: new Prisma.Decimal(precioMax) } })
    }

    const orderBy: OrderBy = {}
    const [field, direction] = ordenar.split('_')
    if (['precio', 'nombre', 'creadoEl'].includes(field)) {
      orderBy[field] = direction.toLowerCase() as 'asc' | 'desc'
    } else {
      orderBy.nombre = 'asc'
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
              slug: true
            }
          },
          imagenes: {
            select: {
              url: true,
              alt: true
            },
            orderBy: {
              orden: 'asc'
            }
          }
        },
        orderBy,
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.producto.count({ where })
    ])

    // Serializar los datos antes de enviarlos
    const serializedProducts = productos.map(product => ({
      ...product,
      precio: Number(product.precio),
      precioOferta: product.precioOferta ? Number(product.precioOferta) : null,
      imagenes: product.imagenes.map(img => ({
        url: img.url,
        alt: img.alt || product.nombre
      }))
    }))

    return NextResponse.json({
      productos: serializedProducts,
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina)
    })

  } catch (error) {
    console.error('Error en API de catálogo:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
} 