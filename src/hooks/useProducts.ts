import { useState, useCallback } from 'react'
import { Product } from '@/interfaces/Product'
import { toast } from 'react-hot-toast'
import type { FilterParams } from '@/interfaces/FilterParams'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = useCallback(async (filters?: FilterParams) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ admin: 'true', t: Date.now().toString() })
      
      // Agregar filtros a los parámetros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al cargar productos')
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los productos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar producto')
      }

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar producto')
      }

      await fetchProducts()

      return result.data
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  return {
    products,
    isLoading,
    fetchProducts,
    updateProduct,
    setProducts
  }
} 