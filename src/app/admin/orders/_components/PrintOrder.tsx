'use client'

import { FaPrint } from 'react-icons/fa'
import { Order } from '@/interfaces/Order'

interface PrintOrderProps {
  order: Order
}

export default function PrintOrder({ order }: PrintOrderProps) {
  const handlePrint = async () => {
    try {
      const response = await fetch(`/api/orders/${order.id}?format=pdf`, {
        method: 'GET',
      })
      
      if (!response.ok) throw new Error('Error al generar el PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Error al imprimir:', error)
      alert('Error al generar el PDF')
    }
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 rounded-lg hover:bg-gray-50"
      title="Imprimir orden"
    >
      <FaPrint />
      <span>Imprimir</span>
    </button>
  )
} 