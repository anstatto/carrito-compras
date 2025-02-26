import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const address = await prisma.direccion.findFirst({
      where: {
        userId: params.id,
        predeterminada: true
      }
    })

    return NextResponse.json({
      hasDefaultAddress: !!address,
      address
    })
  } catch (error) {
    console.error('Error al obtener dirección:', error)
    return NextResponse.json(
      { error: "Error al obtener la dirección" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Si es predeterminada, quitar predeterminada de otras direcciones
    if (body.predeterminada) {
      await prisma.direccion.updateMany({
        where: {
          userId: params.id,
          predeterminada: true
        },
        data: {
          predeterminada: false
        }
      })
    }

    const address = await prisma.direccion.create({
      data: {
        ...body,
        userId: params.id
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error al crear dirección:', error)
    return NextResponse.json(
      { error: "Error al crear la dirección" },
      { status: 500 }
    )
  }
} 