'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Category } from '@/interfaces/Category'

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Error al cargar categorías')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      toast.error('Error al cargar las categorías')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Error al eliminar categoría')
      
      toast.success('Categoría eliminada')
      setCategories(categories.filter(cat => cat.id !== id))
    } catch (error) {
      toast.error('Error al eliminar la categoría')
      console.error(error)
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: !currentStatus })
      })

      if (!res.ok) throw new Error('Error al actualizar estado')
      await fetchCategories()
      toast.success('Estado actualizado')
    } catch (error) {
      toast.error('Error al actualizar estado')
      console.error(error)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full shadow-lg"
        />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent"
          >
            Gestión de Categorías
          </motion.h1>
          
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            
            <Link
              href="/admin/categories/new"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <FaPlus className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Nueva Categoría</span>
              <span className="font-medium sm:hidden">Nuevo</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-8">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                  <Image
                    src={category.imagen || '/placeholder.jpg'}
                    alt={category.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{category.nombre}</h3>
                  <p className="text-gray-600 mt-1">{category.descripcion}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(category.id, category.activa)}
                    className={`p-3 rounded-xl transition-all ${
                      category.activa 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200 hover:scale-105'
                    }`}
                  >
                    {category.activa ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
                  </button>

                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                  >
                    <FaEdit className="w-5 h-5" />
                  </Link>

                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredCategories.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-md"
            >
              <p className="text-xl text-gray-500 font-medium">No se encontraron categorías</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}