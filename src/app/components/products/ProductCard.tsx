'use client'

import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '../cart/AddToCartButton'

interface Product {
  id: string
  nombre: string
  precio: number
  precioOferta?: number | null
  enOferta?: boolean
  imagenes: { url: string; alt: string | null }[]
  slug: string
  descripcion: string
  categoria: {
    id: string
    nombre: string
    slug: string
  }
}

export default function ProductCard({ product }: { product: Product }) {
  const precioFinal = product.enOferta && product.precioOferta 
    ? Number(product.precioOferta) 
    : Number(product.precio)

  return (
    <div className="group relative flex flex-col">
      <Link href={`/productos/${product.slug}`} className="flex-1">
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
          <Image
            src={product.imagenes[0]?.url || '/placeholder-product.jpg'}
            alt={product.nombre}
            fill
            priority={true}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.enOferta && (
            <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-md text-sm">
              Oferta
            </div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2">
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
      <div className="mt-4">
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
