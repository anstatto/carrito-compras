import { useState, useCallback } from 'react'
import { Product } from '@/interfaces/Product'
import { toast } from 'react-hot-toast'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Error al cargar productos')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error(error)
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar producto')
      }

      const updatedProduct = await response.json()
      
      // Actualizamos el estado local en lugar de hacer un nuevo fetch
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? updatedProduct : product
        )
      )

      return updatedProduct
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    products,
    isLoading,
    fetchProducts,
    updateProduct
  }
} 