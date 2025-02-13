'use client'

import { useNotification } from '@/app/hooks/useNotification'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { MarcaProducto } from '@prisma/client'

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

interface CartItem {
  id: string
  nombre: string
  precio: number
  imagen: string
  marca: MarcaProducto
  cantidad: number
  existencias: number
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { showError, showSuccess } = useNotification()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (isAdding) return

    try {
      setIsAdding(true)

      if (product.existencias <= 0) {
        throw new Error('Producto sin stock disponible')
      }

      // Obtener el carrito actual del localStorage
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[]
      
      // Buscar si el producto ya existe en el carrito
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id)
      
      if (existingItemIndex >= 0) {
        // Si existe, incrementar la cantidad
        const newQuantity = currentCart[existingItemIndex].cantidad + 1
        if (newQuantity > product.existencias) {
          throw new Error('Stock insuficiente')
        }
        currentCart[existingItemIndex].cantidad = newQuantity
      } else {
        // Si no existe, agregar nuevo item
        currentCart.push({
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          marca: product.marca,
          cantidad: 1,
          existencias: product.existencias
        })
      }

      // Guardar el carrito actualizado
      localStorage.setItem('cart', JSON.stringify(currentCart))
      
      showSuccess('Producto agregado al carrito')
      
      // Disparar un evento personalizado para notificar cambios en el carrito
      window.dispatchEvent(new Event('cartUpdated'))
      
    } catch (error) {
      console.error('Error adding product to cart:', error)
      showError(error instanceof Error ? error.message : 'Error al agregar al carrito')
    } finally {
      setTimeout(() => {
        setIsAdding(false)
      }, 1000)
    }
  }

  return (
    <motion.button 
      onClick={handleAddToCart}
      disabled={Boolean(isAdding || product.existencias <= 0)}
      className="group relative flex items-center justify-center gap-2 
      px-6 py-3 rounded-full font-medium w-full
      transition-all duration-300 ease-in-out
      bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-pink-500/25
      disabled:cursor-not-allowed disabled:opacity-60
      transform active:scale-95"
      aria-label={product.existencias <= 1 ? 'Sin stock' : 'Agregar al carrito'}
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
        ) : product.existencias <= 0 ? (
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
            <span>Agregar al carrito</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
} 