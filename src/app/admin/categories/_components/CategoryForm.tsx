'use client'

import React, { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ImageSelector } from './ImageSelector'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import type { Categoria } from '@prisma/client'
import slugify from 'slugify'

interface CategoryFormProps {
  category?: Categoria
}

const initialFormData = {
  nombre: '',
  descripcion: '',
  imagen: '',
  slug: '',
  activa: true,
}

// Memoizar el botón de submit para evitar re-renders innecesarios
const SubmitButton = memo(({ isSubmitting, isEditing }: { 
  isSubmitting: boolean, 
  isEditing: boolean 
}) => (
  <motion.button
    type="submit"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={isSubmitting}
    className="px-8 py-2.5 text-white bg-gradient-to-r from-pink-500 to-violet-500 
               rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
               hover:shadow-pink-500/20 hover:shadow-2xl transition-all duration-300"
  >
    {isSubmitting ? (
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
      />
    ) : (
      isEditing ? 'Actualizar Categoría' : 'Crear Categoría'
    )}
  </motion.button>
))
SubmitButton.displayName = 'SubmitButton'

// Optimizar el formulario principal
export const CategoryForm = memo(function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(
    category
      ? {
          nombre: category.nombre,
          descripcion: category.descripcion || '',
          imagen: category.imagen || '',
          slug: category.slug,
          activa: category.activa,
        }
      : initialFormData
  )

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generar slug si no existe
      if (!formData.slug) {
        formData.slug = slugify(formData.nombre, { lower: true })
      }

      const url = category
        ? `/api/categories/${category.id}`
        : '/api/categories'

      const res = await fetch(url, {
        method: category ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error al guardar categoría')
      }
      
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada')
      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, category, router])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value
    setFormData({ 
      ...formData, 
      nombre,
      slug: slugify(nombre, { lower: true })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group"
        >
          <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600 transition-colors">
            Nombre
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={handleNameChange}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                     focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                     transition-all duration-200 bg-white/50 shadow-inner
                     placeholder:text-gray-400 text-gray-700"
            placeholder="Ingresa el nombre de la categoría"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group"
        >
          <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600 transition-colors">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                     focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 
                     transition-all duration-200 bg-white/50 shadow-inner
                     placeholder:text-gray-400 text-gray-700"
            placeholder="URL amigable (se genera automáticamente)"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group"
        >
          <label className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-pink-600 transition-colors">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                     focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500
                     transition-all duration-200 bg-white/50 shadow-inner
                     placeholder:text-gray-400 text-gray-700 resize-none"
            placeholder="Describe los detalles de la categoría..."
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
          className="flex items-center space-x-3 bg-gray-50/80 p-4 rounded-xl"
        >
          <div className="relative inline-block">
            <input
              type="checkbox"
              id="active-toggle"
              checked={formData.activa}
              onChange={e => setFormData({ ...formData, activa: e.target.checked })}
              className="sr-only peer"
            />
            <label
              htmlFor="active-toggle"
              className="flex w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 
                       peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full 
                       peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                       after:left-[2px] after:bg-white after:border-gray-300 after:border 
                       after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r 
                       peer-checked:from-pink-500 peer-checked:to-violet-500 cursor-pointer shadow-inner"
            />
          </div>
          <span className="text-sm font-semibold text-gray-800">Estado Activo</span>
        </motion.div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link
          href="/admin/categories"
          className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-200 
                   rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200
                   shadow-sm hover:shadow focus:outline-none focus:ring-4 
                   focus:ring-gray-200 font-medium"
        >
          Cancelar
        </Link>
        <SubmitButton isSubmitting={isSubmitting} isEditing={!!category} />
      </div>
    </form>
  )
}) 