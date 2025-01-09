import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'


interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        existencias: true,
        stockMinimo: true,
        slug: true,
        sku: true,
        activo: true,
        enOferta: true,
        precioOferta: true,
        destacado: true,
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        imagenes: {
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            url: true,
            alt: true,
            principal: true,
            orden: true
          }
        }
      }
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const data = await request.json()
    
    // Validar datos requeridos
    if (!data.nombre || !data.precio || !data.categoriaId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Actualizar producto
    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        existencias: data.existencias,
        stockMinimo: data.stockMinimo,
        categoriaId: data.categoriaId,
        slug: data.slug || data.nombre.toLowerCase().replace(/ /g, '-'),
        sku: data.sku || `SKU-${Date.now()}`,
        activo: data.activo
      }
    })

    // Si hay imágenes nuevas, actualizar
    if (data.imagenes?.length > 0) {
      // Eliminar imágenes anteriores
      await prisma.image.deleteMany({
        where: { productoId: params.id }
      })

      // Crear nuevas imágenes
      await prisma.image.createMany({
        data: data.imagenes.map((img: { url: string; alt: string }, index: number) => ({
          url: img.url,
          alt: img.alt || producto.nombre,
          principal: index === 0,
          orden: index,
          productoId: producto.id
        }))
      })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Primero eliminar imágenes relacionadas
    await prisma.image.deleteMany({
      where: { productoId: params.id }
    })

    // Luego eliminar el producto
    await prisma.producto.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Si solo es activar/desactivar, cambiar oferta o destacado
    if (data.activo !== undefined || data.enOferta !== undefined || data.destacado !== undefined) {
      const producto = await prisma.producto.update({
        where: { 
          id: params.id 
        },
        data: {
          activo: data.activo,
          enOferta: data.enOferta,
          destacado: data.destacado,
          precioOferta: data.precioOferta ? new Prisma.Decimal(data.precioOferta) : undefined,
          actualizadoEl: new Date()
        },
        include: {
          categoria: true,
          imagenes: {
            select: {
              id: true,
              url: true,
              alt: true
            }
          }
        }
      })

      return NextResponse.json(producto)
    }

    // Si es actualización completa del producto
    const producto = await prisma.producto.update({
      where: { 
        id: params.id 
      },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: new Prisma.Decimal(data.precio),
        existencias: parseInt(String(data.existencias)),
        stockMinimo: parseInt(String(data.stockMinimo)),
        categoriaId: data.categoriaId,
        sku: data.sku,
        slug: data.slug,
        destacado: data.destacado,
        actualizadoEl: new Date()
      },
      include: {
        categoria: true,
        imagenes: {
          select: {
            id: true,
            url: true,
            alt: true,
            principal: true,
            orden: true
          }
        }
      }
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const product = await prisma.producto.create({
      data: {
        ...data,
        precio: new Prisma.Decimal(data.precio),
        precioOferta: data.enOferta && data.precioOferta 
          ? new Prisma.Decimal(data.precioOferta) 
          : null
      },
      include: {
        categoria: true,
        imagenes: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}