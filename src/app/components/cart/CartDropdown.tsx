'use client'

import { useCart } from '@/app/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { FaTrash, FaTimes, FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '@/app/hooks/useNotification'

interface CartItemType {
  id: string
  productoId: string
  cantidad: number
  nombre: string
  precio: number
  imagen: string
  marca: string
  producto: {
    nombre: string
    precio: number
    existencias: number
    imagenes: {
      url: string
      alt: string | null
    }[]
  }
}

export default function CartDropdown() {
  const cart = useCart()
  const { items, removeItem, updateQuantity, total, loading } = cart as unknown as {
    items: CartItemType[]
    removeItem: (id: string) => Promise<void>
    updateQuantity: (id: string, quantity: number) => void
    total: number
    loading: boolean
  }
  const { showError, showSuccess } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const dropdownAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  }

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    const maxStock = item.producto?.existencias
    if (typeof maxStock !== 'number') {
      showError('Error al verificar el stock')
      return
    }

    if (newQuantity > maxStock) {
      showError(`Solo hay ${maxStock} unidades disponibles`)
      return
    }

    if (newQuantity >= 1) {
      try {
        await updateQuantity(id, newQuantity)
        showSuccess('Cantidad actualizada')
      } catch (error) {
        console.error(error)
        showError('Error al actualizar cantidad')
      }
    }
  }

  const handleRemoveItem = async (id: string) => {
    try {
      await removeItem(id)
    } catch (error) {
      console.error(error)
      showError('Error al eliminar el producto')
    }
  }

  const cartItemAnimation = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2 }
  }

  if (loading) {
    return <div className="relative p-2">
      <div className="animate-spin">
        <FaShoppingCart className="w-6 h-6" />
      </div>
    </div>
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 hover:text-pink-500 transition-colors"
      >
        <FaShoppingCart className="w-6 h-6" />
        <AnimatePresence>
          {items.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 
                       rounded-full flex items-center justify-center font-medium"
            >
              {items.length}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...dropdownAnimation}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tu Carrito</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </motion.button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <motion.div 
                  {...cartItemAnimation}
                  className="p-8 text-center text-gray-500"
                >
                  <FaShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Tu carrito está vacío</p>
                </motion.div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item: CartItemType) => (
                      <motion.div
                        key={item.id}
                        {...cartItemAnimation}
                        layout
                        className="flex gap-4 items-center p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="relative w-16 h-16">
                          <Image
                            src={item.imagen || '/images/placeholder.png'}
                            alt={item.nombre}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.nombre}</h4>
                          <p className="text-sm text-gray-500">
                            {item.marca.replace('_', ' ')}
                          </p>
                          <p className="text-pink-500 font-semibold">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                                className="p-1 hover:text-pink-500"
                              >
                                <FaMinus size={12} />
                              </motion.button>
                              <span className="w-8 text-center">{item.cantidad}</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                                className="p-1 hover:text-pink-500"
                              >
                                <FaPlus size={12} />
                              </motion.button>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <FaTrash className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border-t bg-gray-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <motion.span 
                    key={total}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-pink-600"
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full bg-pink-500 text-white text-center py-3 rounded-lg 
                           hover:bg-pink-600 transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Proceder al pago
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 