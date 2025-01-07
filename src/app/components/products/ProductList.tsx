'use client'

import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

interface Product {
  id: string
  nombre: string
  precio: number
  precioOferta: number | null
  enOferta: boolean
  imagenes: {
    url: string
    alt?: string
  }[]
  slug: string
  destacado: boolean
  existencias: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Error al cargar productos')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        setError('Error al cargar los productos')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!products.length) {
    return <div className="text-center text-gray-500">No hay productos disponibles</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
