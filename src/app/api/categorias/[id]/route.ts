import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import slugify from 'slugify'

// GET - Obtener una categoría específica
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: params.id },
      include: {
        productos: true
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error al obtener la categoría:', error)
    return NextResponse.json(
      { error: 'Error al obtener la categoría' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una categoría
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { nombre, descripcion, imagen, activa } = body

    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data: {
        nombre,
        descripcion,
        imagen,
        activa,
        slug: nombre ? slugify(nombre, { lower: true }) : undefined
      }
    })

    return NextResponse.json(categoria)
  } catch (error) {
    console.error('Error al actualizar la categoría:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una categoría
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si hay productos asociados
    const productosCount = await prisma.producto.count({
      where: { categoriaId: params.id }
    })

    if (productosCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría con productos asociados' },
        { status: 400 }
      )
    }

    await prisma.categoria.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar la categoría:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    )
  }
} 