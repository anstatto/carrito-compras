import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtrado
    const categoria = searchParams.get('categoria')
    const precioMin = searchParams.get('precioMin')
    const precioMax = searchParams.get('precioMax')
    const ordenar = searchParams.get('ordenar') || 'nombre_asc'
    const pagina = Math.max(1, parseInt(searchParams.get('pagina') || '1'))
    const porPagina = Math.max(1, parseInt(searchParams.get('porPagina') || '12'))

    // Construir where con condiciones de precio
    const where: any = {
      AND: [
        categoria ? { categoriaId: categoria } : {},
        precioMin ? { precio: { gte: parseFloat(precioMin) } } : {},
        precioMax ? { precio: { lte: parseFloat(precioMax) } } : {},
      ]
    }

    // Configurar ordenamiento
    const orderBy: any = {}
    const [field, direction] = ordenar.split('_')
    if (field === 'precio' || field === 'nombre' || field === 'createdAt') {
      orderBy[field] = direction.toLowerCase()
    } else {
      orderBy.nombre = 'asc' // ordenamiento por defecto
    }

    // Obtener productos y total
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true
            }
          }
        },
        orderBy,
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.producto.count({ where })
    ])

    return NextResponse.json({
      productos,
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