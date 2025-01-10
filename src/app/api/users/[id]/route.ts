import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import bcrypt from "bcryptjs"


interface Params {
  params: {
    id: string
  }
}

interface UpdateUserData {
  nombre: string
  apellido: string
  email: string
  password?: string
  role?: 'USER' | 'ADMIN'
  telefono?: string
  activo?: boolean
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        activo: true,
        creadoEl: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener el usuario' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nombre, apellido, email, password, role, activo } = body

    if (!nombre || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }

    let updateData: UpdateUserData = {
      nombre,
      apellido,
      email,
      role: role as 'USER' | 'ADMIN',
      activo
    }

    if (password) {
      updateData = {
        ...updateData,
        password: await bcrypt.hash(password, 10)
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        activo: true,
        creadoEl: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    if (body.role && !['USER', 'ADMIN'].includes(body.role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    const updateData = {
      ...(body.role && { role: body.role as 'USER' | 'ADMIN' }),
      ...(typeof body.activo === 'boolean' && { activo: body.activo }),
      actualizadoEl: new Date()
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        role: true,
        activo: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
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

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Usuario eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
} 