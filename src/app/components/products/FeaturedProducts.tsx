'use client'

import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './ProductCard'
import { ProductView } from '@/interfaces/Product'
import { FaStar } from 'react-icons/fa'

interface FeaturedProductsProps {
  products: ProductView[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#FFF0F5]/70 via-white to-[#FFF0F5]/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaStar className="text-[#FF69B4] text-3xl animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF69B4] bg-[#FFF0F5] dark:bg-[#FF69B4]/10 py-2 px-4 rounded-full">
              Destacados
            </span>
            <FaStar className="text-[#FF69B4] text-3xl animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#FF69B4] via-[#FF82AB] to-[#FF1493] text-transparent bg-clip-text">
            Productos Destacados
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg font-light">
            Descubre nuestra selección especial de productos más populares
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="group relative"
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <ProductCard product={product} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {products.length > 8 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold 
                       py-4 px-8 rounded-full hover:opacity-90 transition-all duration-300
                       flex items-center gap-2 mx-auto"
            >
              Ver más productos
              <span className="text-xl">→</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  )
} 