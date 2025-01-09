import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const destacado = searchParams.get('destacado') === 'true'
    
    const where: Prisma.ProductoWhereInput = {
      activo: true,
      ...(destacado && { destacado: true }),
      ...(searchParams.get('categoria') && { 
        categoriaId: searchParams.get('categoria') || undefined
      }),
      ...(searchParams.get('enOferta') === 'true' && { 
        enOferta: true,
        precioOferta: {
          not: null,
          gt: 0
        }
      }),
      ...((searchParams.get('precioMin') || searchParams.get('precioMax')) && {
        AND: [
          searchParams.get('precioMin') ? {
            precio: { gte: new Prisma.Decimal(searchParams.get('precioMin')!) }
          } : {},
          searchParams.get('precioMax') ? {
            precio: { lte: new Prisma.Decimal(searchParams.get('precioMax')!) }
          } : {}
        ].filter(Boolean)
      }),
      ...(searchParams.get('buscar') && {
        OR: [
          { 
            nombre: { 
              contains: searchParams.get('buscar') || '',
              mode: Prisma.QueryMode.insensitive
            }
          },
          { 
            descripcion: { 
              contains: searchParams.get('buscar') || '',
              mode: Prisma.QueryMode.insensitive
            }
          }
        ]
      })
    }

    let orderBy: Prisma.ProductoOrderByWithRelationInput = { 
      creadoEl: 'desc' 
    }
    
    switch (searchParams.get('ordenar')) {
      case 'precio_asc':
        orderBy = { precio: 'asc' }
        break
      case 'precio_desc':
        orderBy = { precio: 'desc' }
        break
      case 'nombre_asc':
        orderBy = { nombre: 'asc' }
        break
      case 'nombre_desc':
        orderBy = { nombre: 'desc' }
        break
      case 'ofertas':
        orderBy = {
          enOferta: 'desc',
          precioOferta: 'asc'
        }
        break
    }

    const productos = await prisma.producto.findMany({
      where,
      orderBy,
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
            alt: true,
            principal: true
          },
          orderBy: {
            orden: 'asc'
          }
        }
      }
    })

    return NextResponse.json(productos)
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
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const nombre = formData.get('nombre') as string
    const descripcion = formData.get('descripcion') as string
    const precio = Number(formData.get('precio'))
    const existencias = Number(formData.get('existencias'))
    const stockMinimo = Number(formData.get('stockMinimo'))
    const categoriaId = formData.get('categoriaId') as string
    const slug = formData.get('slug') as string
    const sku = formData.get('sku') as string
    const activo = formData.get('activo') === 'true'
    const imagenes = formData.getAll('imagenes') as File[]
    
    if (!nombre || !precio || !categoriaId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio,
        existencias,
        stockMinimo,
        categoriaId,
        slug: slug || nombre.toLowerCase().replace(/ /g, '-'),
        sku: sku || `SKU-${Date.now()}`,
        activo
      }
    })

    if (imagenes.length > 0) {
      const imagenesData = await Promise.all(imagenes.map(async (imagen, index) => {
        return {
          url: '/placeholder-product.jpg',
          alt: nombre,
          principal: index === 0,
          orden: index,
          productoId: producto.id
        }
      }))

      await prisma.image.createMany({
        data: imagenesData
      })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}
