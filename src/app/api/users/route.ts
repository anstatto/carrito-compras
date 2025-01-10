import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import bcrypt from "bcryptjs"

// Definir interfaz para el caché
interface UserCache {
  id: string
  nombre: string
  apellido: string
  email: string
  role: 'USER' | 'ADMIN'
  activo: boolean
  creadoEl: string
}

// Implementar caché
export let usersCache: UserCache[] | null = null

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Agregar timeout para evitar carga infinita
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )

    const usersPromise = prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        activo: true,
        creadoEl: true,
      },
      orderBy: { creadoEl: 'desc' }
    })

    const users = await Promise.race([usersPromise, timeoutPromise])
      .then(result => result as Awaited<typeof usersPromise>)
      .catch(error => {
        if (error.message === 'Timeout') {
          throw new Error('La solicitud tardó demasiado tiempo')
        }
        throw error
      })
    // Actualizar caché
    usersCache = users.map(user => ({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      role: user.role,
      activo: user.activo,
      creadoEl: user.creadoEl.toISOString()
    }))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error al obtener usuarios'
    }, { status: 500 })
  }
}

interface CreateUserData {
  nombre: string
  apellido: string
  email: string
  password: string
  role?: 'USER' | 'ADMIN'
  telefono?: string
  activo?: boolean
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

    const body = await request.json()
    const userData: CreateUserData = {
      nombre: body.nombre,
      apellido: body.apellido,
      email: body.email,
      password: body.password,
      role: body.role as 'USER' | 'ADMIN',
      telefono: body.telefono,
      activo: body.activo
    }

    if (!userData.nombre || !userData.email || !userData.password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role || 'USER',
        activo: userData.activo ?? true,
        actualizadoEl: new Date()
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,
        telefono: true,
        activo: true,
        creadoEl: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
} 