'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id: string
  cantidad: number
  precioUnit: {
    toString: () => string
  }
  subtotal: {
    toString: () => string
  }
  producto: {
    nombre: string
    imagenes: Array<{
      url: string
    }>
    precio: {
      toString: () => string
    }
  }
}

interface Order {
  id: string
  numero: string
  creadoEl: string
  estado: string
  estadoPago: string
  total: number
  items: OrderItem[]
}

export default function PedidosPage() {
  const { status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/perfil/pedidos')
      return
    }

    const fetchPedidos = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/pedidos')
        
        if (!res.ok) {
          throw new Error('Error al cargar los pedidos')
        }
        
        const data = await res.json()
        setPedidos(data)
      } catch (error) {
        console.error('Error al cargar los pedidos:', error)
        toast.error('No se pudieron cargar los pedidos')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchPedidos()
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No tienes pedidos aún</h2>
        <p className="text-gray-500 mb-6">¡Explora nuestro catálogo y realiza tu primera compra!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/catalogo')}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Ver catálogo
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Mis Pedidos</h2>
      
      <div className="space-y-6">
        {pedidos.map((pedido) => (
          <motion.div
            key={pedido.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Pedido #{pedido.numero}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(pedido.creadoEl), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm
                    ${pedido.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      pedido.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                      pedido.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {pedido.estado}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm
                    ${pedido.estadoPago === 'PAGADO' ? 'bg-green-100 text-green-800' :
                      pedido.estadoPago === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}
                  >
                    {pedido.estadoPago}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {pedido.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={item.producto.imagenes[0]?.url || '/images/placeholder.png'}
                        alt={item.producto.nombre}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.producto.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.cantidad} × RD${Number(item.precioUnit.toString()).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium text-pink-600">
                      RD${Number(item.subtotal.toString()).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold text-lg text-pink-600">
                    RD${Number(pedido.total.toString()).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 