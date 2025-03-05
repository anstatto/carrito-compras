import { useCallback } from 'react'
import { Order } from '@/interfaces/Order'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const formatMoney = (amount: number | string | { toString: () => string } | null | undefined) => {
  if (amount === null || typeof amount === 'undefined') return 'RD$0.00'
  const value = typeof amount === 'number' ? amount : parseFloat(amount.toString())
  if (isNaN(value)) return 'RD$0.00'
  return `RD$${value.toFixed(2)}`
}

export const usePrintOrder = () => {
  const printOrder = useCallback(async (order: Order) => {
    try {
      // Validar que la orden tenga los datos necesarios
      if (!order || !order.numero) {
        toast.error('La orden no tiene los datos necesarios')
        return
      }

      // Cargar los datos completos de la orden
      let fullOrder: Order
      try {
        const res = await fetch(`/api/orders/${order.id}`)
        if (!res.ok) throw new Error('Error al cargar la orden')
        const data = await res.json()
        fullOrder = {
          ...data,
          estado: data.estado,
          creadoEl: new Date(data.creadoEl),
          actualizadoEl: new Date(data.actualizadoEl)
        }
      } catch (error) {
        console.error('Error al cargar los datos completos:', error)
        fullOrder = order // Si falla, usamos los datos que tenemos
      }

      // Crear un iframe visible temporalmente para debugging
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'fixed'
      printFrame.style.right = '-9999px'
      printFrame.style.bottom = '0'
      document.body.appendChild(printFrame)

      // Preparar los datos del cliente y dirección con valores por defecto
      const clienteInfo = {
        nombre: fullOrder.cliente?.nombre || 'No disponible',
        apellido: fullOrder.cliente?.apellido || '',
        email: fullOrder.cliente?.email || 'No disponible',
        telefono: fullOrder.cliente?.telefono || 'N/A'
      }

      const direccionInfo = {
        calle: fullOrder.direccion?.calle || 'No disponible',
        numero: fullOrder.direccion?.numero || 'S/N',
        sector: fullOrder.direccion?.sector || 'No disponible',
        municipio: fullOrder.direccion?.municipio || 'No disponible',
        provincia: fullOrder.direccion?.provincia || 'No disponible'
      }

      // Contenido del documento
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Orden #${fullOrder.numero}</title>
            <style>
              @media print {
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  margin: 0;
                }
                * {
                  box-sizing: border-box;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #333;
                }
                .header p {
                  margin: 5px 0;
                  color: #666;
                }
                .grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  margin-bottom: 30px;
                }
                .info-section {
                  padding: 15px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                }
                .info-section h2 {
                  margin: 0 0 10px 0;
                  font-size: 18px;
                  color: #333;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }
                th, td {
                  padding: 12px;
                  text-align: left;
                  border-bottom: 1px solid #ddd;
                }
                th {
                  background-color: #f8f9fa;
                  font-weight: 600;
                }
                .text-right {
                  text-align: right;
                }
                .text-center {
                  text-align: center;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #ddd;
                  color: #666;
                }
                .offer-price {
                  color: #e91e63;
                }
                .regular-price {
                  text-decoration: line-through;
                  color: #999;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ArlingLow Care</h1>
                <p>Orden #${fullOrder.numero}</p>
                <p>${format(new Date(fullOrder.creadoEl || Date.now()), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
              </div>

              <div class="grid">
                <div class="info-section">
                  <h2>Información del Cliente</h2>
                  <p>${clienteInfo.nombre} ${clienteInfo.apellido}</p>
                  <p>Email: ${clienteInfo.email}</p>
                  <p>Tel: ${clienteInfo.telefono}</p>
                </div>

                <div class="info-section">
                  <h2>Dirección de Envío</h2>
                  <p>${direccionInfo.calle} #${direccionInfo.numero}</p>
                  <p>${direccionInfo.sector}, ${direccionInfo.municipio}</p>
                  <p>${direccionInfo.provincia}</p>
                  ${fullOrder.direccion?.agenciaEnvio ? `
                    <p>${fullOrder.direccion.agenciaEnvio.replace(/_/g, ' ')}</p>
                    ${fullOrder.direccion.sucursalAgencia ? `<p>${fullOrder.direccion.sucursalAgencia}</p>` : ''}
                  ` : ''}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-right">Precio</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${fullOrder.items?.map(item => `
                    <tr>
                      <td>
                        <div>
                          <strong>${item.producto?.nombre || 'Producto no disponible'}</strong>
                          ${item.enOferta ? '<br><small class="offer-tag">En oferta</small>' : ''}
                        </div>
                      </td>
                      <td class="text-center">${item.cantidad || 0}</td>
                      <td class="text-right">
                        ${item.enOferta 
                          ? `<span class="regular-price">${formatMoney(item.precioRegular)}</span><br>
                             <span class="offer-price">${formatMoney(item.precioOferta)}</span>`
                          : formatMoney(item.precioUnit)
                        }
                      </td>
                      <td class="text-right">${formatMoney(item.subtotal)}</td>
                    </tr>
                  `).join('') || '<tr><td colspan="4" class="text-center">No hay productos</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-right">Subtotal:</td>
                    <td class="text-right">${formatMoney(fullOrder.subtotal)}</td>
                  </tr>
                  ${fullOrder.impuestos > 0 ? `
                    <tr>
                      <td colspan="3" class="text-right">Impuestos:</td>
                      <td class="text-right">${formatMoney(fullOrder.impuestos)}</td>
                    </tr>
                  ` : ''}
                  ${fullOrder.costoEnvio > 0 ? `
                    <tr>
                      <td colspan="3" class="text-right">Envío:</td>
                      <td class="text-right">${formatMoney(fullOrder.costoEnvio)}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" class="text-right"><strong>Total:</strong></td>
                    <td class="text-right"><strong>${formatMoney(fullOrder.total)}</strong></td>
                  </tr>
                </tfoot>
              </table>

              <div class="footer">
                <p>¡Gracias por su compra!</p>
              </div>
            </div>
          </body>
        </html>
      `

      // Obtener el documento del iframe
      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document
      if (!frameDoc) throw new Error('No se pudo crear el documento de impresión')

      // Escribir el contenido y esperar a que se cargue
      frameDoc.open()
      frameDoc.write(content)
      frameDoc.close()

      // Esperar a que el contenido se cargue completamente
      await new Promise((resolve) => {
        printFrame.onload = resolve
        setTimeout(resolve, 1000) // Fallback por si onload no se dispara
      })

      // Imprimir
      const win = printFrame.contentWindow
      if (win) {
        win.focus() // Asegurarse de que la ventana tiene el foco
        win.print()
      }

      // Remover el iframe después de un tiempo
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame)
        }
      }, 2000)

    } catch (error) {
      console.error('Error al imprimir:', error)
      toast.error('Error al generar la impresión')
    }
  }, [])

  return { printOrder }
} 