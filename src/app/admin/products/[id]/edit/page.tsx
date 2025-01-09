'use client'

import { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { ProductForm } from '@/app/admin/products/_components/ProductForm'
import { toast } from 'react-hot-toast'
import type { ProductFormData } from '@/interfaces/Product'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: Props) {
  const [product, setProduct] = useState<ProductFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const id = React.use(params).id

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Error al cargar producto')
        const data = await res.json()
        
        const formData: ProductFormData = {
          ...data,
          categoriaId: data.categoria.id,
          imagenes: data.imagenes || []
        }
        
        setProduct(formData)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar el producto')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Producto no encontrado</h2>
        <Link 
          href="/admin/products"
          className="mt-4 inline-block text-pink-600 hover:text-pink-700"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700 transition-colors">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      <ProductForm
        formData={product}
        setFormData={setProduct}
        isEditing={true}
      />
    </div>
  )
} 