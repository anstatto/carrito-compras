import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
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
            nombre: true,
            slug: true
          }
        },
        imagenes: {
          orderBy: {
            orden: 'asc'
          },
          select: {
            id: true,
            url: true,
            alt: true,
            principal: true
          }
        }
      },
      orderBy: {
        creadoEl: 'desc'
      }
    })
    
    const productosFormateados = productos.map(producto => ({
      ...producto,
      precio: Number(producto.precio),
      precioOferta: producto.precioOferta ? Number(producto.precioOferta) : null
    }))
    
    return NextResponse.json(productosFormateados)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
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
