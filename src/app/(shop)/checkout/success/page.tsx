'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaCheckCircle } from 'react-icons/fa'
import React from 'react'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get('payment_intent')

  useEffect(() => {
    if (paymentIntent) {
      // Limpiar el carrito
      localStorage.removeItem('cart')
      // Disparar evento para actualizar el carrito en otros componentes
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }, [paymentIntent])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
      <p className="text-gray-600 mb-8">
        Tu pedido ha sido confirmado y está siendo procesado.
      </p>
      <div className="space-x-4">
        <button
          onClick={() => router.push('/perfil/pedidos')}
          className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
        >
          Ver mis pedidos
        </button>
        <button
          onClick={() => router.push('/catalogo')}
          className="px-6 py-2 border border-pink-500 text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  )
} 