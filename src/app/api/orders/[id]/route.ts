import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import type { UserOptions } from 'jspdf-autotable'
import type { Order } from '@/interfaces/Order'

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: { finalY: number };
}

async function generatePDF(order: Order) {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    }) as jsPDFWithAutoTable

    // Configurar fuente
    doc.setFont('helvetica')

    // Agregar encabezado
    doc.setFontSize(20)
    doc.text('ArlingLow Care', doc.internal.pageSize.width / 2, 20, { align: 'center' })
    
    doc.setFontSize(14)
    doc.text(`Orden #${order.numero}`, doc.internal.pageSize.width / 2, 30, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text(
      `Fecha: ${order.creadoEl ? new Date(order.creadoEl).toLocaleDateString('es-ES') : ''}`,
      doc.internal.pageSize.width / 2,
      37,
      { align: 'center' }
    )

    // Información del cliente
    doc.setFontSize(12)
    doc.text('Cliente:', 20, 50)
    doc.setFontSize(10)
    doc.text([
      `${order.cliente.nombre} ${order.cliente.apellido}`,
      `Email: ${order.cliente.email}`,
      `Tel: ${order.cliente.telefono || 'N/A'}`
    ], 20, 55)

    // Dirección
    doc.setFontSize(12)
    doc.text('Envío:', 20, 75)
    doc.setFontSize(10)
    const direccionLines = [
      `${order.direccion.calle} #${order.direccion.numero}`,
      `${order.direccion.sector}, ${order.direccion.municipio}`,
      order.direccion.provincia
    ]

    if (order.direccion.agenciaEnvio) {
      direccionLines.push(
        `${order.direccion.agenciaEnvio.replace(/_/g, ' ')}`,
        order.direccion.sucursalAgencia || ''
      )
    }

    doc.text(direccionLines, 20, 80)

    // Tabla de productos
    const tableData = order.items?.map(item => [
      item.producto.nombre,
      item.cantidad.toString(),
      `RD$${Number(item.precioUnit).toFixed(2)}`,
      `RD$${(Number(item.precioUnit) * item.cantidad).toFixed(2)}`
    ]) || []

    doc.autoTable({
      startY: 100,
      head: [['Producto', 'Cant.', 'Precio', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [233, 30, 99],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      }
    })

    const finalY = doc.lastAutoTable?.finalY || 120
    doc.setFontSize(12)
    doc.text(
      `Total: RD$${Number(order.total).toFixed(2)}`,
      doc.internal.pageSize.width - 20,
      finalY + 10,
      { align: 'right' }
    )

    doc.setFontSize(8)
    const pageHeight = doc.internal.pageSize.height
    doc.text('¡Gracias por su compra!', doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' })

    return Buffer.from(doc.output('arraybuffer'))
  } catch (error) {
    console.error('Error en generatePDF:', error)
    throw new Error('Error al generar el PDF')
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de orden no proporcionado' },
        { status: 400 }
      )
    }

    const order = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        items: {
          include: {
            producto: true
          }
        },
        direccion: true,
        metodoPago: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    if (format === 'pdf') {
      try {
        const orderForPdf = {
          ...order,
          subtotal: order.subtotal.toNumber(),
          impuestos: order.impuestos.toNumber(),
          costoEnvio: order.costoEnvio.toNumber(),
          total: order.total.toNumber(),
          items: order.items.map(item => ({
            ...item,
            precioUnit: item.precioUnit.toNumber(),
            subtotal: item.subtotal.toNumber(),
            producto: {
              ...item.producto,
              precio: item.producto.precio.toNumber()
            }
          }))
        }

        const pdfBuffer = await generatePDF(orderForPdf as unknown as Order)
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="orden-${order.numero}.pdf"`,
            'Cache-Control': 'public, max-age=300'
          }
        })
      } catch (pdfError) {
        console.error('Error generando PDF:', pdfError)
        return NextResponse.json(
          { error: 'Error al generar el PDF' },
          { status: 500 }
        )
      }
    }

    // Retornar datos JSON si no se solicita PDF
    const orderData = {
      numero: order.numero,
      fecha: order.creadoEl ? new Date(order.creadoEl).toLocaleString('es-ES') : '',
      cliente: {
        nombre: `${order.cliente?.nombre || ''} ${order.cliente?.apellido || ''}`.trim(),
        email: order.cliente?.email || '',
        telefono: order.cliente?.telefono || 'No especificado'
      },
      direccion: {
        calle: `${order.direccion.calle} #${order.direccion.numero}`,
        sector: order.direccion.sector,
        municipio: order.direccion.municipio,
        provincia: order.direccion.provincia,
        agencia: order.direccion.agenciaEnvio,
        sucursal: order.direccion.sucursalAgencia
      },
      items: order.items.map(item => ({
        producto: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnit: Number(item.precioUnit).toFixed(2),
        subtotal: (Number(item.precioUnit) * item.cantidad).toFixed(2)
      })),
      total: Number(order.total).toFixed(2),
      estado: order.estado,
      metodoPago: order.metodoPago?.tipo || 'No especificado'
    }

    return NextResponse.json(orderData)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener los datos de la orden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de orden no proporcionado' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { estado } = body

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para cambiar el estado' },
        { status: 401 }
      )
    }

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { 
        estado,
        actualizadoEl: new Date()
      }
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
} 