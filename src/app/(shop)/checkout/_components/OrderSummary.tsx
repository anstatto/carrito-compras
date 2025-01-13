'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface CartItem {
  id: string
  nombre: string
  precio: number
  imagen: string
  cantidad: number
}

interface OrderSummaryProps {
  items: CartItem[]
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100"
    >
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        Resumen del pedido
      </h2>
      
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-pink-50/50 transition-colors"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-pink-50">
              <Image 
                src={item.imagen} 
                alt={item.nombre} 
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.nombre}</p>
              <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
            </div>
            <p className="font-semibold text-pink-500">
              RD${(item.precio * item.cantidad).toFixed(2)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-pink-100">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-pink-500">RD${total.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  )
} 