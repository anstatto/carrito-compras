'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface TopProduct {
  id: string
  nombre: string
  ventas: number
  imagen?: string
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      const res = await fetch('/api/dashboard/top-products')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Productos Más Vendidos</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {products.map((product) => (
          <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              {product.imagen && (
                <div className="flex-shrink-0 h-10 w-10 relative">
                  <Image
                    src={product.imagen}
                    alt={product.nombre}
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 768px) 40px, 40px"
                  />
                </div>
              )}
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {product.nombre}
                </div>
                <div className="text-sm text-gray-500">
                  {product.ventas} ventas
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 