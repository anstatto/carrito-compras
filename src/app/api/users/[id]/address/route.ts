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

    return NextResponse.json({
      address: address || null
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

    if (!body) {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud está vacío" },
        { status: 400 }
      )
    }

    // Validar campos requeridos
    const requiredFields = ['calle', 'numero', 'sector', 'municipio', 'provincia', 'telefono']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

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
        userId: id,
        predeterminada: body.predeterminada ?? true // Si no se especifica, hacerla predeterminada
      }
    })

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Error al crear dirección:', error)
    return NextResponse.json(
      { error: "Error al crear la dirección" },
      { status: 500 }
    )
  }
} 