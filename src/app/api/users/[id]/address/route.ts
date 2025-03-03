import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const address = await prisma.direccion.findFirst({
      where: {
        userId: id,
        predeterminada: true
      }
    })

    if (!address) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
          userId: id,
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
        userId: id
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