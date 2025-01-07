'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Category {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  slug: string
  activa: boolean
  creadoEl: string
  actualizadoEl: string
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: ''
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Error al guardar la categoría')
      
      toast.success(editingCategory 
        ? 'Categoría actualizada correctamente'
        : 'Categoría creada correctamente'
      )
      
      setShowModal(false)
      setEditingCategory(null)
      setFormData({ nombre: '', descripcion: '', imagen: '' })
      fetchCategories()
    } catch (error) {
      toast.error('Error al guardar la categoría')
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Error al eliminar categoría')
      
      toast.success('Categoría eliminada correctamente')
      setCategories(categories.filter(cat => cat.id !== id))
    } catch (error) {
      toast.error('Error al eliminar la categoría')
      console.error(error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      nombre: category.nombre,
      descripcion: category.descripcion || '',
      imagen: category.imagen || ''
    })
    setShowModal(true)
  }

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h1>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ nombre: '', descripcion: '', imagen: '' })
            setShowModal(true)
          }}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center gap-2"
        >
          <FaPlus /> Nueva Categoría
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={category.imagen || '/placeholder-category.jpg'}
                alt={category.nombre}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{category.nombre}</h3>
              <p className="text-gray-600 text-sm mt-1">{category.descripcion}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  category.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.activa ? 'Activa' : 'Inactiva'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL de Imagen</label>
                  <input
                    type="text"
                    value={formData.imagen}
                    onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600"
                >
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 