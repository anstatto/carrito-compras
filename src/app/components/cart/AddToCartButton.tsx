'use client'

import { useCart } from '@/app/context/CartContext'
import { useNotification } from '@/app/hooks/useNotification'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type Product = {
  id: string
  nombre: string
  precio: number
  imagen: string
  stock?: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const { showSuccess, showError } = useNotification()
  const [isAdding, setIsAdding] = useState(false)
  
  const itemInCart = items.find(item => item.id === product.id)
  const currentQuantity = itemInCart?.cantidad || 0
  const isOutOfStock = product.stock && currentQuantity >= product.stock

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showError('No hay más stock disponible')
      return
    }

    setIsAdding(true)
    
    try {
      addItem({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1,
        imagen: product.imagen || '/images/placeholder.png',
      })

      showSuccess('¡Producto agregado al carrito!')
    } catch {
      showError('Error al agregar al carrito')
    } finally {
      setTimeout(() => setIsAdding(false), 800)
    }
  }

  return (
    <motion.button 
      onClick={handleAddToCart}
      disabled={Boolean(isAdding || isOutOfStock)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={`
        group relative flex items-center justify-center gap-2 
        px-6 py-3 rounded-full font-medium w-full
        transition-all duration-300 ease-in-out
        ${isAdding ? 'bg-green-500' : isOutOfStock ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'}
        text-white shadow-lg hover:shadow-pink-500/25
        disabled:cursor-not-allowed disabled:opacity-60
      `}
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