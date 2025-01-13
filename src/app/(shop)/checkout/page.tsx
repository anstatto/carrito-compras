'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import CheckoutForm from './_components/CheckoutForm'
import OrderSummary from './_components/OrderSummary'
import AddressSelector from './_components/AddressSelector'
import { toast } from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CartItem {
  id: string
  nombre: string
  precio: number
  imagen: string
  cantidad: number
}

const calculateOrderTotal = (items: CartItem[]) => {
  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
  return { total }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout')
      return
    }

    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cartItems.length === 0) {
      router.push('/catalogo')
      return
    }
    setItems(cartItems)
    setIsLoading(false)
  }, [router, status])

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId)
  }

  const initializePayment = async () => {
    try {
      if (!session?.user) {
        toast.error('Debes iniciar sesión para continuar')
        router.push('/login?callbackUrl=/checkout')
        return
      }

      if (!selectedAddress) {
        toast.error('Por favor selecciona una dirección de envío')
        return
      }

      const { total } = calculateOrderTotal(items)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            cantidad: item.cantidad,
            precio: item.precio
          })),
          direccionId: selectedAddress,
          total
        })
      })

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Ya tienes un pedido pendiente en proceso') {
          toast.error('Ya tienes un pedido en proceso. Por favor, completa ese pago primero o espera unos minutos.');
          if (errorData.orderId) {
            router.push(`/perfil/pedidos/${errorData.orderId}`);
          } else {
            router.push('/perfil/pedidos');
          }
          return;
        }
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)

    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al iniciar el pago')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Finalizar compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <AddressSelector 
            onSelect={handleAddressSelect}
            selected={selectedAddress}
          />

          {clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#ec4899',
                  },
                },
              }}
            >
              <CheckoutForm />
            </Elements>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={initializePayment}
              disabled={!selectedAddress}
              className="w-full py-4 px-6 rounded-xl text-center font-medium
                bg-gradient-to-r from-pink-500 to-pink-600
                hover:from-pink-600 hover:to-pink-700
                text-white transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-pink-500/25"
            >
              Continuar al pago
            </motion.button>
          )}
        </div>
        <div>
          <OrderSummary items={items} />
        </div>
      </div>
    </motion.div>
  )
} 