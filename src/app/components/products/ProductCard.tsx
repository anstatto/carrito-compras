'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  nombre: string
  precio: number
  precioOferta?: number | null
  enOferta?: boolean
  imagenes: { url: string; alt?: string }[]
  slug: string
}

export default function ProductCard({ product }: { product: Product }) {
  const precioFinal = product.enOferta && product.precioOferta 
    ? Number(product.precioOferta) 
    : Number(product.precio)

  return (
    <Link href={`/productos/${product.slug}`} className="group">
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
        <Image
          src={product.imagenes[0]?.url || '/placeholder-product.jpg'}
          alt={product.imagenes[0]?.alt || product.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {product.nombre}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-pink-600">
            ${precioFinal.toFixed(2)}
          </span>
          {product.enOferta && product.precioOferta && (
            <span className="text-sm text-gray-500 line-through">
              ${Number(product.precio).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
