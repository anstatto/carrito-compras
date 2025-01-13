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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Verificar que la dirección pertenece al usuario
    const direccionExistente = await prisma.direccion.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!direccionExistente) {
      return NextResponse.json(
        { error: "Dirección no encontrada" },
        { status: 404 }
      )
    }

    // Validaciones similares al POST
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

    // Validaciones adicionales
    if (!Object.values(ProvinciaRD).includes(body.provincia)) {
      return NextResponse.json(
        { error: "Provincia inválida" },
        { status: 400 }
      )
    }

    if (!isValidPhone(body.telefono)) {
      return NextResponse.json(
        { error: "Formato de teléfono inválido" },
        { status: 400 }
      )
    }

    if (body.celular && !isValidPhone(body.celular)) {
      return NextResponse.json(
        { error: "Formato de celular inválido" },
        { status: 400 }
      )
    }

    if (body.agenciaEnvio && !Object.values(AgenciaEnvio).includes(body.agenciaEnvio)) {
      return NextResponse.json(
        { error: "Agencia de envío inválida" },
        { status: 400 }
      )
    }

    const direccionData = {
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

    // Si la dirección será predeterminada, actualizar las otras
    if (direccionData.predeterminada && !direccionExistente.predeterminada) {
      await prisma.direccion.updateMany({
        where: { 
          userId: session.user.id,
          predeterminada: true,
          NOT: {
            id: params.id
          }
        },
        data: { predeterminada: false }
      })
    }

    const direccionActualizada = await prisma.direccion.update({
      where: { id: params.id },
      data: direccionData
    })

    return NextResponse.json(direccionActualizada)
  } catch (error) {
    console.error('Error al actualizar dirección:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al actualizar dirección" },
      { status: 500 }
    )
  }
}

// También podemos agregar DELETE si se necesita
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que la dirección pertenece al usuario
    const direccion = await prisma.direccion.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!direccion) {
      return NextResponse.json(
        { error: "Dirección no encontrada" },
        { status: 404 }
      )
    }

    await prisma.direccion.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Dirección eliminada correctamente" })
  } catch (error) {
    console.error('Error al eliminar dirección:', error)
    return NextResponse.json(
      { error: "Error al eliminar dirección" },
      { status: 500 }
    )
  }
} 