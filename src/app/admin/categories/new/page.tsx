'use client'

import { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { CategoryForm } from '../_components/CategoryForm'
import type { CategoryFormData } from '@/interfaces/Category'

export default function NewCategoryPage() {
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: '',
    descripcion: '',
    imagen: null,
    slug: '',
    activa: true
  })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories" className="text-gray-500 hover:text-gray-700 transition-colors">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Nueva Categoría</h1>
      </div>

      <CategoryForm
        formData={formData}
        setFormData={setFormData}
        isEditing={false}
      />
    </div>
  )
} 