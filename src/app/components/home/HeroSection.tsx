'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-transparent to-white">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('/gallery/fondo.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-4xl mx-auto backdrop-blur-sm bg-white/40 
                       rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-[1.02] 
                       transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold 
                         text-gray-800 mb-6 font-serif animate-fade-in"
              >
                Arlin Glow Care
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 
                         max-w-2xl font-light leading-relaxed"
              >
                Descubre nuestra exclusiva colección de productos para el cuidado de tu belleza
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10"
              >
                {['100% Natural', 'Envíos a Todo el País', 'Productos Premium'].map((text) => (
                  <motion.span
                    key={text}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-200/80 text-pink-900 
                             rounded-full text-sm font-medium transform transition-transform"
                  >
                    {text}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto"
              >
                <Link
                  href="/catalogo"
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-pink-600 text-white 
                           rounded-full font-medium hover:bg-pink-700 transform 
                           hover:scale-105 transition-all duration-300 shadow-lg 
                           hover:shadow-pink-400/50 text-center"
                >
                  Ver Catálogo
                </Link>
                <Link
                  href="/ofertas"
                  className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-white text-pink-600 
                           rounded-full font-medium hover:bg-pink-100 transform 
                           hover:scale-105 transition-all duration-300 shadow-lg text-center"
                >
                  Ofertas Especiales
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 