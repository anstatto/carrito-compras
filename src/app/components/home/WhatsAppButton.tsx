'use client'

import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/8297828831"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 
                 text-white p-4 rounded-full shadow-xl hover:shadow-green-500/25 
                 transition-all duration-300 z-50 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 20px 25px -5px rgb(34 197 94 / 0.25)'
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 10, 0],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        <FaWhatsapp className="text-3xl group-hover:animate-pulse" />
      </motion.div>
      <span className="absolute -top-10 right-0 bg-white text-green-600 px-3 py-1 
                     rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 
                     transition-opacity shadow-lg whitespace-nowrap">
        ¡Escríbenos!
      </span>
    </motion.a>
  )
} 