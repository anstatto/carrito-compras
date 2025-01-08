import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        nombre: true,
        apellido: true,
        email: true,
        telefono: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nombre, apellido, telefono } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nombre,
        apellido,
        telefono
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
} 