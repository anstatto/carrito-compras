'use client'

import { FaPrint } from 'react-icons/fa'
import { Order } from '@/interfaces/Order'
import { usePrintOrder } from '@/hooks/usePrintOrder'

interface PrintOrderProps {
  order: Order
}

export default function PrintOrder({ order }: PrintOrderProps) {
  const { printOrder } = usePrintOrder()

  return (
    <button
      onClick={() => printOrder(order)}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 rounded-lg hover:bg-gray-50"
      title="Imprimir orden"
    >
      <FaPrint />
      <span>Imprimir</span>
    </button>
  )
} 