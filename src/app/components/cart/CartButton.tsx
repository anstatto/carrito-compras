'use client'
import { useState } from 'react'
import { useCart } from '@/app/context/CartContext'
import Image from 'next/image'

export default function CartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, total, removeItem, updateQuantity } = useCart()

  const handleWhatsAppCheckout = () => {
    const message = items
      .map(item => `• ${item.nombre} (x${item.cantidad}) - $${(item.precio * item.cantidad).toFixed(2)}`)
      .join('\n')
    const totalMessage = `\n\nTotal: $${total.toFixed(2)}`
    const fullMessage = `¡Hola! Me gustaría hacer el siguiente pedido:\n\n${message}${totalMessage}`
    
    window.open(`https://wa.me/TUNUMERO?text=${encodeURIComponent(fullMessage)}`, '_blank')
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        Carrito ({items.length})
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-4">El carrito está vacío</p>
          ) : (
            <>
              <div className="max-h-96 overflow-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b">
                    <div className="relative w-16 h-16">
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.nombre}</h4>
                      <p className="text-pink-600">${item.precio.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.cantidad - 1))}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between font-semibold mb-4">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full btn-primary mb-2"
                >
                  Pedir por WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
} 