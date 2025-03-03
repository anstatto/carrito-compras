import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import puppeteer from 'puppeteer'
import type { Order } from '@/interfaces/Order'

async function generatePDF(order: Order) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  })
  const page = await browser.newPage()
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Orden #${order.numero}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 128px;
          height: 128px;
          margin-bottom: 15px;
          object-fit: contain;
        }
        .order-title {
          font-size: 24px;
          margin: 10px 0;
        }
        .order-number {
          font-size: 16px;
          color: #666;
        }
        .section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 5px;
        }
        .section-title {
          font-size: 18px;
          color: #2c5282;
          margin-bottom: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 5px;
          margin: 10px 0;
        }
        .label {
          font-weight: bold;
          color: #4a5568;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .products-table th {
          background: #f7fafc;
          padding: 10px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }
        .products-table td {
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://arlinglowcare.shop/favicon.ico" class="logo" alt="Logo">
        <h1 class="order-title">Orden de Compra</h1>
        <div class="order-number">#${order.numero}</div>
        <div class="order-date">${order.creadoEl ? new Date(order.creadoEl).toLocaleDateString('es', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Fecha no disponible'}</div>
      </div>

      <div class="section">
        <h2 class="section-title">Información del Cliente</h2>
        <div class="info-grid">
          <span class="label">Nombre:</span>
          <span>${order.cliente.nombre} ${order.cliente.apellido}</span>
          <span class="label">Email:</span>
          <span>${order.cliente.email}</span>
          <span class="label">Teléfono:</span>
          <span>${order.cliente.telefono || 'No especificado'}</span>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Dirección de Envío</h2>
        <div class="info-grid">
          <span class="label">Dirección:</span>
          <span>${order.direccion.calle} #${order.direccion.numero}</span>
          <span class="label">Sector:</span>
          <span>${order.direccion.sector}</span>
          <span class="label">Municipio:</span>
          <span>${order.direccion.municipio}</span>
          <span class="label">Provincia:</span>
          <span>${order.direccion.provincia}</span>
          ${order.direccion.agenciaEnvio ? `
            <span class="label">Agencia:</span>
            <span>${order.direccion.agenciaEnvio.replace(/_/g, ' ')}</span>
          ` : ''}
          ${order.direccion.sucursalAgencia ? `
            <span class="label">Sucursal:</span>
            <span>${order.direccion.sucursalAgencia}</span>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Productos</h2>
        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map((item) => `
              <tr>
                <td>${item.producto.nombre}</td>
                <td>${item.cantidad}</td>
                <td>RD$${Number(item.precioUnit).toFixed(2)}</td>
                <td>RD$${(Number(item.precioUnit) * item.cantidad).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          Total: RD$${Number(order.total).toFixed(2)}
        </div>
      </div>

      <div class="footer">
        <p>¡Gracias por tu compra!</p>
 
      </div>
    </body>
    </html>
  `

  await page.setContent(html)
  const pdf = await page.pdf({
    format: 'A4',
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  })

  await browser.close()
  return pdf
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
          'Content-Disposition': `attachment; filename="orden-${order.numero}.pdf"`
        }
      })
    }

    // Si no se solicita PDF, devolver los datos en JSON
    const orderData = {
      numero: order.numero,
      fecha: order.creadoEl ? new Date(order.creadoEl).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
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