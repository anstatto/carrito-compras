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
      const submitData = {
        ...formData,
        precio: Number(formData.precio) || 0,
        existencias: Number(formData.existencias) || 0,
        stockMinimo: Number(formData.stockMinimo) || 0,
        enOferta: Boolean(formData.enOferta),
        precioOferta: formData.enOferta && formData.precioOferta 
          ? Number(formData.precioOferta) 
          : null,
        activo: Boolean(formData.activo),
        destacado: Boolean(formData.destacado)
      }

      console.log('Enviando datos:', submitData)

      const url = isEditing 
        ? `/api/products/${formData.id}`
        : '/api/products'

      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.details || 'Error al guardar producto')
      }
      
      toast.success(isEditing ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Validar que sea un número positivo con máximo 2 decimales
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      const precio = value === '' ? 0 : parseFloat(value)
      setFormData({ ...formData, precio })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl">
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition duration-150 ease-in-out hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Ingrese el nombre del producto"
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition duration-150 ease-in-out hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={formData.precio === 0 ? '' : formData.precio.toString()}
              onChange={handlePriceChange}
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition duration-150 ease-in-out hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
              required
              pattern="^\d*\.?\d{0,2}$"
              title="Ingrese un precio válido con hasta 2 decimales"
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">Formato: 0.00</span>
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
            onKeyPress={(e) => {
              if (!/\d/.test(e.key)) {
                e.preventDefault()
              }
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition duration-150 ease-in-out hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Cantidad disponible"
            min="0"
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition duration-150 ease-in-out hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Describe el producto..."
            required
          />
        </motion.div>

        <ImageSelector
          currentImages={formData.imagenes}
          onImagesChange={(images) => {
            setFormData({
              ...formData,
              imagenes: images
            })
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="group"
        >
          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg mb-4">
            <div className="relative inline-block">
              <input
                type="checkbox"
                id="oferta-toggle"
                checked={formData.enOferta}
                onChange={e => setFormData({ ...formData, enOferta: e.target.checked })}
                className="sr-only peer"
              />
              <label
                htmlFor="oferta-toggle"
                className="flex w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 
                         peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full 
                         peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                         after:left-[2px] after:bg-white after:border-gray-300 after:border 
                         after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r 
                         peer-checked:from-pink-500 peer-checked:to-violet-500 cursor-pointer shadow-inner"
              />
            </div>
            <span className="text-sm font-semibold text-gray-800">En Oferta</span>
          </div>

          {formData.enOferta && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Oferta
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioOferta || ''}
                  onChange={e => setFormData({
                    ...formData,
                    precioOferta: parseFloat(e.target.value)
                  })}
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="0.00"
                  required={formData.enOferta}
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="group"
        >
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="destacado"
                checked={formData.destacado}
                onChange={e => setFormData({ ...formData, destacado: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-pink-600 
                         focus:ring-pink-500 transition duration-150 ease-in-out"
              />
              <label htmlFor="destacado" className="text-sm font-semibold text-gray-800">Destacado</label>
            </div>

            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-pink-600 
                         focus:ring-pink-500 transition duration-150 ease-in-out"
              />
              <label htmlFor="activo" className="text-sm font-semibold text-gray-800">Activo</label>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/admin/products"
          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150 ease-in-out"
        >
          Cancelar
        </Link>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-white bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg disabled:opacity-50 transition duration-150 ease-in-out"
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