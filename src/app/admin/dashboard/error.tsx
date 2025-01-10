'use client'

import { motion } from 'framer-motion'
import { FaExclamationTriangle } from 'react-icons/fa'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8"
    >
      <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {error.message || 'Algo salió mal al cargar el dashboard'}
      </h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => reset()}
        className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        Intentar de nuevo
      </motion.button>
    </motion.div>
  )
}