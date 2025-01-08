'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ImageSelector } from './ImageSelector'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import type { ProductFormData } from '@/interfaces/Product'
import type { Category } from '@/interfaces/Category'

interface ProductFormProps {
  formData: ProductFormData
  setFormData: (data: ProductFormData) => void
  isEditing: boolean
}

export function ProductForm({ formData, setFormData, isEditing }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Error al cargar categorías')
      const data = await res.json()
      setCategories(data)
    } catch {
      toast.error('Error al cargar las categorías')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = isEditing 
        ? `/api/products/${formData.id}`
        : '/api/products'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al guardar producto')
      
      toast.success(isEditing ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={formData.categoriaId}
            onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <input
            type="number"
            step="0.01"
            value={formData.precio}
            onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            value={formData.existencias}
            onChange={e => setFormData({ ...formData, existencias: parseInt(e.target.value) })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2"
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            rows={4}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </motion.div>

        <ImageSelector
          currentImages={formData.imagenes}
          onImagesChange={(urls) => setFormData({ ...formData, imagenes: urls })}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            checked={formData.activo}
            onChange={e => setFormData({ ...formData, activo: e.target.checked })}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <label className="text-sm font-medium text-gray-700">Activo</label>
        </motion.div>
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/admin/products"
          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-white bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg disabled:opacity-50"
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