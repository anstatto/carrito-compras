import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AgenciaEnvio, ProvinciaRD } from "@prisma/client"

// Función auxiliar para validar el teléfono
const isValidPhone = (phone: string) => {
  const phoneRegex = /^[\d\s-+()]{8,20}$/
  return phoneRegex.test(phone)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Primero verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.error('Usuario no encontrado en BD:', session.user.id)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const direcciones = await prisma.direccion.findMany({
      where: { 
        userId: user.id  // Usar el ID del usuario verificado
      },
      orderBy: [
        { predeterminada: 'desc' },
        { creadoEl: 'desc' }
      ]
    })

    return NextResponse.json(direcciones)
  } catch (error) {
    console.error('Error completo:', error)
    return NextResponse.json(
      { error: "Error al obtener direcciones" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validación de campos requeridos
    const requiredFields = [
      'calle', 
      'numero',
      'sector', 
      'municipio', 
      'provincia', 
      'telefono'
    ]

    const missingFields = requiredFields.filter(field => !body[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Los siguientes campos son requeridos: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validación de provincia
    if (!Object.values(ProvinciaRD).includes(body.provincia)) {
      return NextResponse.json(
        { error: "Provincia inválida" },
        { status: 400 }
      )
    }

    // Validación de teléfono
    if (!isValidPhone(body.telefono)) {
      return NextResponse.json(
        { error: "Formato de teléfono inválido" },
        { status: 400 }
      )
    }

    // Validación de celular si se proporciona
    if (body.celular && !isValidPhone(body.celular)) {
      return NextResponse.json(
        { error: "Formato de celular inválido" },
        { status: 400 }
      )
    }

    // Validación de agencia de envío si se proporciona
    if (body.agenciaEnvio && !Object.values(AgenciaEnvio).includes(body.agenciaEnvio)) {
      return NextResponse.json(
        { error: "Agencia de envío inválida" },
        { status: 400 }
      )
    }

    const direccionData = {
      userId: session.user.id,
      calle: body.calle.trim(),
      numero: body.numero.trim(),
      sector: body.sector.trim(),
      municipio: body.municipio.trim(),
      provincia: body.provincia as ProvinciaRD,
      codigoPostal: body.codigoPostal?.trim() || null,
      referencia: body.referencia?.trim() || null,
      telefono: body.telefono.trim(),
      celular: body.celular?.trim() || null,
      agenciaEnvio: body.agenciaEnvio as AgenciaEnvio || null,
      sucursalAgencia: body.sucursalAgencia?.trim() || null,
      predeterminada: Boolean(body.predeterminada)
    }

    // Si la nueva dirección es predeterminada, actualizar las otras
    if (direccionData.predeterminada) {
      await prisma.direccion.updateMany({
        where: { 
          userId: session.user.id,
          predeterminada: true
        },
        data: { predeterminada: false }
      })
    }

    // Crear la nueva dirección
    const direccion = await prisma.direccion.create({
      data: direccionData
    })

    return NextResponse.json(direccion)
  } catch (error) {
    console.error('Error detallado al crear dirección:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al crear dirección" },
      { status: 500 }
    )
  }
} 