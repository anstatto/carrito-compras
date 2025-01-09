'use client'

import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '../cart/AddToCartButton'
import { motion } from 'framer-motion'
import { ProductView } from '@/interfaces/Product'

interface ProductCardProps {
  product: ProductView
}

export default function ProductCard({ product }: ProductCardProps) {
  const precioFinal = product.enOferta && product.precioOferta 
    ? Number(product.precioOferta) 
    : Number(product.precio)

  const descuento = product.enOferta && product.precioOferta
    ? Math.round((1 - (product.precioOferta / product.precio)) * 100)
    : 0

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-gray-800 
                    rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 
                    border border-gray-100 dark:border-gray-700 overflow-hidden">
      <Link href={`/productos/${product.slug}`} className="flex-1">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imagenes[0]?.url || '/placeholder-product.jpg'}
            alt={product.nombre}
            fill
            priority={true}
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.enOferta && (
            <motion.div 
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 
                        text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg
                        border-2 border-white dark:border-gray-800"
            >
              {descuento}% OFF
            </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
        </div>
        
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 
                         group-hover:text-pink-500 transition-colors duration-300">
              {product.nombre}
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-pink-100 dark:bg-pink-900 
                           text-pink-600 dark:text-pink-300 rounded-full whitespace-nowrap">
              {product.categoria.nombre}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.descripcion}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${product.enOferta ? 'text-pink-600' : 'text-gray-900 dark:text-white'}`}>
                ${precioFinal.toFixed(2)}
              </span>
              {product.enOferta && product.precioOferta && (
                <span className="text-sm text-gray-500 line-through">
                  ${Number(product.precio).toFixed(2)}
                </span>
              )}
            </div>
            {product.existencias <= 5 && product.existencias > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                ¡Últimas {product.existencias} unidades!
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-5 pt-0 mt-auto">
        <AddToCartButton 
          product={{
            id: product.id,
            nombre: product.nombre,
            precio: precioFinal,
            imagen: product.imagenes?.[0]?.url || '/images/placeholder.png'
          }} 
        />
      </div>
    </div>
  )
}
