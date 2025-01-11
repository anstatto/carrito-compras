import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'Se requiere userId' },
      { status: 400 }
    )
  }
  try {
    const direcciones = await prisma.direccion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(direcciones)
  } catch (error) {
    console.error('Error al obtener direcciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener las direcciones' },
      { status: 500 }
    )
  }
} 