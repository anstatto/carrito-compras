'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaTrash, FaShoppingCart, FaMinus, FaPlus, FaTimes, FaArrowRight } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '@/app/hooks/useNotification'
import { MarcaProducto } from '@prisma/client'

interface CartItem {
  id: string
  nombre: string
  precio: number
  imagen: string
  marca: MarcaProducto
  cantidad: number
  existencias: number
}

export default function CartDropdown() {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { showError, showSuccess } = useNotification()

  const loadCartItems = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[]
    setItems(cartItems)
    setTotal(cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0))
  }

  useEffect(() => {
    loadCartItems()
    window.addEventListener('cartUpdated', loadCartItems)
    return () => window.removeEventListener('cartUpdated', loadCartItems)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        if (newQuantity < 1) {
          showError('La cantidad mínima es 1')
          return item
        }
        if (newQuantity > item.existencias) {
          showError(`Solo hay ${item.existencias} unidades disponibles`)
          return item
        }
        return { ...item, cantidad: newQuantity }
      }
      return item
    })

    localStorage.setItem('cart', JSON.stringify(updatedItems))
    setItems(updatedItems)
    setTotal(updatedItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    localStorage.setItem('cart', JSON.stringify(updatedItems))
    setItems(updatedItems)
    setTotal(updatedItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0))
    showSuccess('Producto eliminado del carrito')
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = () => {
    localStorage.removeItem('cart')
    setItems([])
    setTotal(0)
    showSuccess('Carrito vaciado')
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-pink-50 transition-colors relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaShoppingCart className="w-6 h-6 text-pink-500" />
        {items.length > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold 
            bg-pink-500 text-white rounded-full flex items-center justify-center"
          >
            {items.length}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl z-50
            border border-pink-100 backdrop-blur-sm"
          >
            <div className="p-4 border-b border-pink-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                Tu Carrito ({items.length})
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-pink-50 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full 
                  flex items-center justify-center"
                >
                  <FaShoppingCart className="w-10 h-10 text-pink-300" />
                </motion.div>
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <Link 
                  href="/catalogo"
                  className="text-pink-500 hover:text-pink-600 font-medium 
                  inline-flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  Ir al catálogo <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="max-h-[60vh] overflow-auto">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-4 hover:bg-pink-50/50 transition-colors"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-pink-50">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 ml-4">
                        <h4 className="font-medium text-gray-800 line-clamp-1">{item.nombre}</h4>
                        <p className="text-pink-500 font-semibold">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </p>
                        <div className="flex items-center mt-2 bg-white rounded-lg w-fit border border-pink-100">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                            className="p-1 hover:text-pink-500 transition-colors"
                          >
                            <FaMinus className="w-3 h-3" />
                          </motion.button>
                          <span className="mx-3 text-sm font-medium">{item.cantidad}</span>
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                            className="p-1 hover:text-pink-500 transition-colors"
                          >
                            <FaPlus className="w-3 h-3" />
                          </motion.button>
                        </div>
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 hover:text-red-500 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 bg-pink-50/50 rounded-b-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-2 py-2 px-4 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                      Vaciar carrito
                    </button>
                    <div>
                      <span className="text-gray-500 mr-2">Total:</span>
                      <span className="text-xl font-bold text-gray-800">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/acuerdopago" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-3 px-4 rounded-xl text-center font-medium
                    bg-gradient-to-r from-pink-500 to-pink-600
                    hover:from-pink-600 hover:to-pink-700
                    text-white transition-all duration-300
                    transform hover:scale-[1.02] active:scale-95
                    shadow-lg hover:shadow-pink-500/25"
                  >
                    Proceder al pago
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
