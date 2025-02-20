'use client'

import { useEffect, useState } from 'react'
import { FaPrint, FaDownload, FaArrowLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { use } from 'react'

interface Order {
  id: string
  numero: string
  cliente: {
    nombre: string
    email: string
  }
  items: Array<{
    cantidad: number
    precioUnit: { toString: () => string }
    subtotal: { toString: () => string }
    producto: {
      nombre: string
      imagenes: Array<{ url: string }>
    }
  }>
  total: { toString: () => string }
  estado: string
  creadoEl: string
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error:', error)
        setLoading(false)
      })
  }, [resolvedParams.id])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!order) {
    return <div>Pedido no encontrado</div>
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const printContent = document.createElement('div')
    printContent.innerHTML = `
      <html>
        <head>
          <title>Orden #${order.numero}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background-color: #ff69b4;
              color: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              color: #ff69b4;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
            }
            .status {
              display: inline-block;
              padding: 5px 10px;
              background: #ff69b4;
              color: white;
              border-radius: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Orden #${order.numero}</h1>
            <p>${new Date(order.creadoEl).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>

          <div>
            <h2>Información del Cliente</h2>
            <p><strong>Nombre:</strong> ${order.cliente.nombre}</p>
            <p><strong>Email:</strong> ${order.cliente.email}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center">Cantidad</th>
                <th style="text-align: right">Precio Unit.</th>
                <th style="text-align: right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.producto.nombre}</td>
                  <td style="text-align: center">${item.cantidad}</td>
                  <td style="text-align: right">RD$${Number(item.precioUnit.toString()).toFixed(2)}</td>
                  <td style="text-align: right">RD$${Number(item.subtotal.toString()).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right"><strong>Total:</strong></td>
                <td style="text-align: right"><strong>RD$${Number(order.total.toString()).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p><span class="status">${order.estado}</span></p>
            <p>¡Gracias por su compra!</p>
            <div style="margin-top: 20px">
              <p>Arlin Glam Care</p>
              <p>Cuidando tu belleza</p>
              <p>Tel: +1 (829) 782-8831</p>
              <p>arlinglowcare@gmail.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML)
      printWindow.document.close()
      printWindow.focus()
      
      // Esperar a que los estilos se carguen
      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 250)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Volver
        </button>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FaPrint className="w-4 h-4" />
            <span>Imprimir</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            <FaDownload className="w-4 h-4" />
            <span>Descargar PDF</span>
          </motion.button>
        </div>
      </div>

      <div id="printable-content" className="bg-white p-8 rounded-lg shadow-lg print:shadow-none">
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div className="w-32">
            <Image 
              src="/logo/logo.png" 
              alt="Arlin Glam Care" 
              width={128}
              height={128}
              className="w-full"
            />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-pink-500">Orden #{order.numero}</h1>
            <p className="text-gray-600">
              {new Date(order.creadoEl).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="mb-8 bg-pink-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-pink-600 mb-4">Información del Cliente</h2>
          <p><strong>Nombre:</strong> {order.cliente.nombre}</p>
          <p><strong>Email:</strong> {order.cliente.email}</p>
        </div>

        <div className="mb-8">
          <table className="w-full">
            <thead className="bg-pink-100">
              <tr>
                <th className="text-left p-4">Producto</th>
                <th className="text-center p-4">Cantidad</th>
                <th className="text-right p-4">Precio Unit.</th>
                <th className="text-right p-4">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <Image 
                        src={item.producto.imagenes[0]?.url || '/placeholder.png'}
                        alt={item.producto.nombre}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <span>{item.producto.nombre}</span>
                    </div>
                  </td>
                  <td className="text-center p-4">{item.cantidad}</td>
                  <td className="text-right p-4">
                    RD${Number(item.precioUnit.toString()).toFixed(2)}
                  </td>
                  <td className="text-right p-4">
                    RD${Number(item.subtotal.toString()).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-pink-50">
                <td colSpan={3} className="text-right p-4 font-bold">Total:</td>
                <td className="text-right p-4 font-bold">
                  RD${Number(order.total.toString()).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center text-gray-600">
          <div className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-600 mb-4">
            {order.estado}
          </div>
          <p className="mb-2">¡Gracias por su compra!</p>
          <div className="mt-6 text-sm">
            <p>Arlin Glam Care</p>
            <p>Cuidando tu belleza</p>
            <p>Tel: +1 (829) 782-8831</p>
            <p>arlinglowcare@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
} 