'use client'

import React, { useState } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { type StripeError } from '@stripe/stripe-js'
import { motion } from 'framer-motion'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setError('')

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) throw submitError

      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              address: { country: 'MX' },
            },
          },
        },
      })

      if (paymentError) throw paymentError
    } catch (err) {
      const stripeError = err as StripeError
      setError(stripeError.message || 'Ocurrió un error al procesar el pago')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100"
        whileHover={{ boxShadow: '0 4px 20px rgba(236, 72, 153, 0.1)' }}
      >
        <h3 className="text-lg font-semibold mb-6 text-gray-800">
          Información de pago
        </h3>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'MX',
                }
              }
            },
            fields: {
              billingDetails: {
                address: {
                  country: 'never',
                }
              }
            }
          }}
        />
      </motion.div>
      
      {error && (
        <motion.div 
          className="bg-red-50 text-red-500 p-4 rounded-xl text-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 px-6 rounded-xl text-center font-medium
          bg-gradient-to-r from-pink-500 to-pink-600
          hover:from-pink-600 hover:to-pink-700
          text-white transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-pink-500/25"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Procesando pago...</span>
          </div>
        ) : (
          'Pagar ahora'
        )}
      </motion.button>
    </motion.form>
  )
} 