'use client'

import { motion } from 'framer-motion'
import Pagination from '../ui/Pagination'
import ProductCard from './ProductCard'

type Product = {
  id: string
  nombre: string
  precio: number
  precioOferta: number | null
  enOferta?: boolean
  imagenes: { url: string; alt: string | null }[]
  descripcion: string
  categoria: {
    id: string
    nombre: string
    slug: string
  }
  slug: string
}

type ProductGridProps = {
  products: Product[]
  total: number
  currentPage: number
  itemsPerPage: number
}

export default function ProductGrid({ products, total, currentPage, itemsPerPage }: ProductGridProps) {
  const totalPages = Math.ceil(total / itemsPerPage)

  if (!products.length) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-gray-600 dark:text-gray-300">
          No se encontraron productos con los filtros seleccionados
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard 
              product={{
                ...product,
                slug: product.id
              }} 
            />
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
        />
      )}
    </div>
  )
} 