'use client'

import { motion } from 'framer-motion'
import ProductInfo from './ProductInfo'
import AddToCartButton from '../cart/AddToCartButton'
import ProductImageGallery from './ProductImageGallery'

interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOferta: number | null
  enOferta: boolean
  marca: string | null
  existencias: number
  slug: string
  categoria: {
    id: string
    nombre: string
    slug: string
  }
  imagenes: {
    url: string
    alt: string | null
  }[]
}

type ProductContentProps = {
  producto: Producto
}

export default function ProductContent({ producto }: ProductContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Galería */}
        <ProductImageGallery 
          images={producto.imagenes.map((img) => ({
            url: img.url,
            alt: img.alt || producto.nombre
          }))}
          name={producto.nombre}
        />
      </motion.div>

      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProductInfo 
          producto={{
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: Number(producto.precio),
            precioOferta: producto.precioOferta ? Number(producto.precioOferta) : null,
            enOferta: producto.enOferta,
            marca: producto.marca || undefined,
            existencias: producto.existencias,
            categoria: {
              nombre: producto.categoria.nombre,
              slug: producto.categoria.slug
            },
            slug: producto.slug
          }}
        />
        
        {producto.existencias > 0 && (
          <AddToCartButton 
            product={{
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precioOferta ? Number(producto.precioOferta) : Number(producto.precio),
              imagen: producto.imagenes[0]?.url || '/placeholder-product.jpg'
            }} 
          />
        )}
      </motion.div>
    </div>
  )
} 