'use client'

import { useCart } from '@/app/context/CartContext'
import { useNotification } from '@/app/hooks/useNotification'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { MarcaProducto } from '@prisma/client'
import { useQueryClient } from '@tanstack/react-query'

interface Product {
  id: string
  nombre: string
  precio: number
  imagen: string
  marca: MarcaProducto
  existencias: number
  categoria?: {
    id: string
    nombre: string
  }
}

declare global {
  interface Window {
    __loggedProducts?: string[]
  }
}
export default function AddToCartButton({ product }: { product: Product }) {
  const { items } = useCart()
  const { showError } = useNotification()
  const [isAdding, setIsAdding] = useState(false)
  const queryClient = useQueryClient()

  const itemInCart = useMemo(() =>
    items.find(item => item.productoId === product.id),
    [items, product.id]
  )
  
  const currentQuantity = useMemo(() => 
    itemInCart?.cantidad || 0,
    [itemInCart]
  )

  const existencias = useMemo(() => 
    typeof product.existencias === 'number' ? product.existencias : 0,
    [product.existencias]
  )
  
  const isOutOfStock = useMemo(() => 
    existencias <= 0,
    [existencias]
  )

  const buttonClassName = useMemo(() => `
    group relative flex items-center justify-center gap-2 
    px-6 py-3 rounded-full font-medium w-full
    transition-all duration-300 ease-in-out
    ${isAdding ? 'bg-green-500' : isOutOfStock ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'}
    text-white shadow-lg hover:shadow-pink-500/25
    disabled:cursor-not-allowed disabled:opacity-60
    transform active:scale-95
  `, [isAdding, isOutOfStock])

  if (process.env.NODE_ENV === 'development' && !window.__loggedProducts?.includes(product.id)) {
    // console.log('Product data:', {
    //   id: product.id,
    //   existencias: product.existencias,
    //   tipo: typeof product.existencias,
    //   producto_completo: product
    // })
    window.__loggedProducts = [...(window.__loggedProducts || []), product.id]
  }
  
  const handleAddToCart = async () => {
    if (isAdding) return

    try {
      setIsAdding(true)
      
      if (existencias <= 0) {
        throw new Error('Producto sin stock disponible')
      }

      if (currentQuantity >= existencias) {
        throw new Error(`Solo quedan ${existencias} unidades disponibles`)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: product.id,
          cantidad: 1
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || 'Error al agregar al carrito')
      }

      await queryClient.invalidateQueries({ queryKey: ['cart'] })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        showError('La operación tardó demasiado tiempo')
      } else {
        showError(error instanceof Error ? error.message : 'Error al agregar al carrito')
      }
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.button 
      onClick={handleAddToCart}
      disabled={Boolean(isAdding || isOutOfStock)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={buttonClassName}
      aria-label={isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
    >
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="adding"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <FaCheck className="w-4 h-4" />
            <span>¡Agregado!</span>
          </motion.div>
        ) : isOutOfStock ? (
          <motion.div
            key="outofstock"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <span>Sin stock</span>
          </motion.div>
        ) : (
          <motion.div
            key="add"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <FaShoppingCart className="w-4 h-4" />
            <span>
              {currentQuantity > 0 ? `Agregar (${currentQuantity})` : 'Agregar al carrito'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="absolute inset-0 h-full w-full rounded-full overflow-hidden">
        <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </span>
    </motion.button>
  )
} 