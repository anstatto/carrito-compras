'use client'

import { FaEye } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface PrintOrderProps {
  order: {
    id: string
    numero: string
  }
}

export default function PrintOrder({ order }: PrintOrderProps) {
  const router = useRouter()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(`/admin/orders/${order.id}`)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <FaEye className="w-4 h-4" />
      <span>Ver Orden</span>
    </motion.button>
  )
} 