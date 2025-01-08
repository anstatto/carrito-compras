'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ImageSelector } from './ImageSelector'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import type { CategoryFormData } from '@/interfaces/Category'

interface CategoryFormProps {
  formData: CategoryFormData
  setFormData: (data: CategoryFormData) => void
  isEditing: boolean
}

export function CategoryForm({ formData, setFormData, isEditing }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = isEditing 
        ? `/api/categories/${formData.id}`
        : '/api/categories'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al guardar categoría')
      
      toast.success(isEditing ? 'Categoría actualizada' : 'Categoría creada')
      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
          />
        </motion.div>

        <ImageSelector
          currentImage={formData.imagen}
          onImageSelect={(url) => setFormData({ ...formData, imagen: url })}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            checked={formData.activa}
            onChange={e => setFormData({ ...formData, activa: e.target.checked })}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 transition-colors duration-200"
          />
          <label className="text-sm font-medium text-gray-700">Activa</label>
        </motion.div>
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/admin/categories"
          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </Link>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-white bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
        >
          {isSubmitting ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
            />
          ) : (
            isEditing ? 'Actualizar' : 'Crear'
          )}
        </motion.button>
      </div>
    </form>
  )
} 