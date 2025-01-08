'use client'

import { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { ProductForm } from '@/app/admin/products/_components/ProductForm'
import { toast } from 'react-hot-toast'
import type { ProductFormData } from '@/interfaces/Product'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<ProductFormData | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (!res.ok) throw new Error('Error al cargar producto')
        const data = await res.json()
        setProduct(data)
      } catch (error) {
        toast.error('Error al cargar el producto')
        console.error(error)
      }
    }

    fetchProduct()
  }, [params.id])

  if (!product) return <div className="loading">Cargando...</div>

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