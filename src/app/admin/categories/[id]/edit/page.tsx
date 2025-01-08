'use client'

import { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { CategoryForm } from '../../_components/CategoryForm'
import { toast } from 'react-hot-toast'
import type { CategoryFormData } from '@/interfaces/Category'

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<CategoryFormData | null>(null)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${params.id}`)
        if (!res.ok) throw new Error('Error al cargar categoría')
        const data = await res.json()
        setCategory(data)
      } catch (error) {
        toast.error('Error al cargar la categoría')
        console.error(error)
      }
    }

    fetchCategory()
  }, [params.id])

  if (!category) return <div className="loading">Cargando...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories" className="text-gray-500 hover:text-gray-700 transition-colors">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Categoría</h1>
      </div>

      <CategoryForm
        formData={category}
        setFormData={setCategory}
        isEditing={true}
      />
    </div>
  )
} 