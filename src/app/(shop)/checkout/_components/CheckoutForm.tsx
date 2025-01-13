'use client'

import React, { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import type { Stripe } from '@stripe/stripe-js'
import { toast } from 'react-hot-toast'

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true)
    }
  }, [stripe, elements])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast.error('No se pudo inicializar el formulario de pago')
      return
    }

    try {
      setIsProcessing(true)
      setError('')

      // Enviar el formulario
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw submitError
      }

      // Confirmar el pago
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              address: { country: 'DO' },
            },
          },
        },
      })

      if (paymentError) {
        throw paymentError
      }

    } catch (err) {
      console.error('Error en el pago:', err)
      const stripeError = err as Stripe.Error
      const errorMessage = stripeError.message || 'Ocurrió un error al procesar el pago'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isReady) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-8"
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
                    country: 'DO',
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
            className="max-w-xl mx-auto"
          />
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-500 p-4 rounded-xl text-sm border border-red-100"
            >
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={!isReady || isProcessing}
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
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Procesando pago...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0" />
              </svg>
              Pagar de forma segura
            </div>
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  )
} 