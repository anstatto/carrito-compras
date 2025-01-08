import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { password } = await request.json()

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(password, admin.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al verificar admin:', error)
    return NextResponse.json(
      { error: 'Error al verificar credenciales' },
      { status: 500 }
    )
  }
} 