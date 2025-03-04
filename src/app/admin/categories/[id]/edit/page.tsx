'use client'

import { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'
import { CategoryForm } from '@/app/admin/categories/_components/CategoryForm'
import { toast } from 'react-hot-toast'
import type { Categoria } from '@prisma/client'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditCategoryPage({ params }: Props) {
  const [category, setCategory] = useState<Categoria | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const id = React.use(params).id

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`)
        if (!res.ok) throw new Error('Error al cargar categoría')
        const data = await res.json()
        setCategory(data)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar la categoría')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Categoría no encontrada</h2>
        <Link 
          href="/admin/categories"
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
        <Link href="/admin/categories" className="text-gray-500 hover:text-gray-700 transition-colors">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Editar Categoría</h1>
      </div>

      <CategoryForm category={category} />
    </div>
  )
} 