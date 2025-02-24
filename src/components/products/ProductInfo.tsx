'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

interface ProductInfoProps {
  producto: {
    id: string
    nombre: string
    descripcion: string
    precio: number
    precioOferta?: number | null
    enOferta: boolean
    marca?: string | null
    existencias: number
    categoria: {
      nombre: string
      slug: string
    }
    slug: string
  }
}

export default function ProductInfo({ producto }: ProductInfoProps) {
  const precioFinal = producto.enOferta && producto.precioOferta 
    ? producto.precioOferta 
    : producto.precio

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {producto.nombre}
        </motion.h1>
        {producto.marca && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">{producto.marca}</p>
        )}
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-2xl font-bold text-[#FF69B4]">
          ${precioFinal.toFixed(2)}
        </span>
        {producto.enOferta && producto.precioOferta && (
          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
            ${producto.precio.toFixed(2)}
          </span>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {producto.descripcion}
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Categoría:</span>
          <Link 
            href={`/catalogo/${producto.categoria.slug}`}
            className="text-pink-600 hover:text-pink-700"
          >
            {producto.categoria.nombre}
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Disponibilidad:</span>
          <span className={`${producto.existencias > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
            {producto.existencias > 0 ? `${producto.existencias} unidades disponibles` : 'Agotado'}
          </span>
        </div>
      </div>

      <Link 
        href={`/productos/${producto.slug}`}
        className="inline-flex items-center gap-2 text-[#FF69B4] hover:text-[#FF1493]"
      >
        Ver detalles del producto
        <FaArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
} 