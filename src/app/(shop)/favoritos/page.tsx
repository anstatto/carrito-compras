'use client'

import { useFavorites } from '@/app/hooks/useFavorites'
import ProductCard from '@/components/products/ProductCard'
import { motion } from 'framer-motion'
import { FaHeart } from 'react-icons/fa'
import { MarcaProducto } from '@prisma/client'

interface Favorito {
  id: string
  producto: {
    id: string
    nombre: string
    descripcion: string
    precio: number
    imagenes: { url: string; alt: string | null }[]
    slug: string
    existencias: number
  }
}

export default function FavoritosPage() {
  const { favorites, isLoading } = useFavorites()

  if (isLoading) {
    return <div className="container mx-auto p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FaHeart className="text-pink-500 text-2xl" />
          <h1 className="text-3xl font-bold">Mis Favoritos</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          {favorites.length} productos en tu lista de favoritos
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="text-gray-300 text-5xl mx-auto mb-4" />
          <p className="text-gray-500">No tienes productos favoritos aún</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {favorites.map((fav: Favorito) => (
            <ProductCard 
              key={fav.id} 
              product={{
                id: fav.producto.id,
                nombre: fav.producto.nombre,
                descripcion: fav.producto.descripcion || '',
                precio: Number(fav.producto.precio),
                precioOferta: null,
                enOferta: false,
                marca: 'OTRO' as MarcaProducto,
                imagenes: fav.producto.imagenes,
                categoria: {
                  nombre: '',
                  slug: ''
                },
                existencias: fav.producto.existencias,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}