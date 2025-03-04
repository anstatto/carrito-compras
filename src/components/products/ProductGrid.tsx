'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Pagination from '../ui/Pagination'
import ProductCard from './ProductCard'
import { ProductView } from '@/interfaces/Product'
import { useRouter, useSearchParams } from 'next/navigation'

interface ProductGridProps {
  products: ProductView[]
  total: number
  currentPage: number
  itemsPerPage: number
  currentSort: string
}

export default function ProductGrid({ 
  products, 
  total, 
  currentPage, 
  itemsPerPage, 
  currentSort,
}: ProductGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / itemsPerPage)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pagina', page.toString())
    router.push(`/catalogo?${params.toString()}`)
  }

  const sortProducts = (products: ProductView[]): ProductView[] => {
    const sorted = [...products]
    
    if (currentSort === 'ofertas') {
      return sorted.sort((a, b) => {
        // Primero productos en oferta
        if (a.enOferta && !b.enOferta) return -1
        if (!a.enOferta && b.enOferta) return 1
        
        // Si ambos están en oferta, ordenar por mayor descuento
        if (a.enOferta && b.enOferta) {
          const descuentoA = ((a.precio - (a.precioOferta || 0)) / a.precio) * 100
          const descuentoB = ((b.precio - (b.precioOferta || 0)) / b.precio) * 100
          return descuentoB - descuentoA
        }
        
        return 0
      })
    }
    
    return sorted
  }

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

  const sortedProducts = sortProducts(products)

  return (
    <div className="space-y-8">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="popLayout">
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
} 