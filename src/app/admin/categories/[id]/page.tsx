'use client'

import { useEffect, useState } from 'react'
import { FaArrowLeft, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import type { Category } from '@/interfaces/Category'
import { OptimizedImage } from '@/components/OptimizedImage'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
}

export default function ShowCategoryPage({ params }: Props) {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const id = React.use(params).id

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${id}`)
        if (!response.ok) {
          throw new Error('Error al obtener la categoría')
        }
        const data = await response.json()
        setCategory(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al cargar la categoría')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategory()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar categoría')
      }
      
      toast.success('Categoría eliminada correctamente')
      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async () => {
    if (!category) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          activa: !category.activa 
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al actualizar estado')
      }

      const updatedCategory = await res.json()
      setCategory(updatedCategory)
      toast.success(updatedCategory.activa ? 'Categoría activada' : 'Categoría desactivada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar estado')
    }
  }

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/categories" 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Detalles de la Categoría</h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleStatus}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-all ${
              category.activa 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={category.activa ? 'Desactivar categoría' : 'Activar categoría'}
          >
            {category.activa ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
          </motion.button>

          <Link
            href={`/admin/categories/${category.id}/edit`}
            className={`p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all ${
              isLoading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <FaEdit className="w-5 h-5" />
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={isLoading}
            className={`p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Eliminar categoría"
          >
            {isLoading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
              />
            ) : (
              <FaTrash className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
              <p className="text-lg font-semibold text-gray-900">{category.nombre}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{category.descripcion}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Imagen</h3>
              <div className="relative aspect-video w-full max-w-2xl rounded-xl overflow-hidden group">
                <OptimizedImage
                  src={category.imagen || '/placeholder.jpg'}
                  alt={category.nombre}
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="transition-transform group-hover:scale-105"
                  fill={true}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="text-gray-500 font-medium">Estado</h3>
              <p className={`mt-1 font-semibold ${category.activa ? 'text-green-600' : 'text-red-600'}`}>
                {category.activa ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Creada</h3>
              <p className="mt-1 font-semibold text-gray-900">
                {new Date(category.creadoEl).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Última actualización</h3>
              <p className="mt-1 font-semibold text-gray-900">
                {new Date(category.actualizadoEl).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 