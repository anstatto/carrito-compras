'use client'

import { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { ProductForm } from '@/app/admin/products/_components/ProductForm'
import type { ProductFormData } from '@/interfaces/Product'

export default function NewProductPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoriaId: '',
    existencias: 0,
    stockMinimo: 5,
    imagenes: [],
    activo: true,
    sku: '',
    slug: ''
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700 transition-colors">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>

      <ProductForm
        formData={formData}
        setFormData={setFormData}
        isEditing={false}
      />
    </div>
  )
} 