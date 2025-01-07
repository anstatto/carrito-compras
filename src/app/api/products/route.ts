import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: {
        creadoEl: 'desc'
      }
    })
    
    return NextResponse.json(productos)
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
    
    // Verificar si el usuario está autenticado y es admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Asegurarse de que los campos requeridos estén presentes
    if (!body.nombre || !body.precio || !body.slug || !body.sku) {
      return NextResponse.json(
        { error: 'Nombre, precio, slug y sku son requeridos' },
        { status: 400 }
      )
    }

    const producto = await prisma.producto.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        precio: body.precio,
        categoria: body.categoria,
        existencias: body.existencias,
        imagenes: body.imagenes || [],
        slug: body.slug,
        sku: body.sku
      }
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    )
  }
}
