'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'

interface Category {
  id: string
  nombre: string
  slug: string
  imagen?: string | null
  descripcion?: string | null
  productCount: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error('Error al cargar categorías')
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-20 sm:py-32 hero-pattern">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-pink-100/50 dark:bg-gray-800 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 sm:py-32 hero-pattern">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text">
            Explora Nuestras Categorías
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubre nuestra amplia selección de productos de belleza y cuidado personal
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Link 
                href={`/catalogo/${category.slug}`}
                className="block relative overflow-hidden rounded-xl aspect-[4/3] card-hover"
              >
                <Image
                  src={category.imagen || '/placeholder-category.jpg'}
                  alt={category.nombre}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/80 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {category.nombre}
                    </h3>
                    {category.descripcion && (
                      <p className="text-white/90 text-sm line-clamp-2 mb-4">
                        {category.descripcion}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-sm text-white bg-white/20 
                                     px-3 py-1 rounded-full backdrop-blur-sm">
                        {category.productCount} productos
                      </span>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="text-white"
                      >
                        <FaArrowRight />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 