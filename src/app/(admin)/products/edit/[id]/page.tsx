'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { FaImage, FaSave } from 'react-icons/fa'
import { useSession } from 'next-auth/react'

interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  existencias: number
  imagenes: string[]
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data)
        } else {
          throw new Error('Error al cargar el producto')
        }
      } catch (error) {
        toast.error('Error al cargar el producto')
        console.error(error)
      }
    }

    fetchProduct()
  }, [params.id, session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (res.ok) {
        toast.success('Producto actualizado exitosamente')
        router.push('/admin/products')
      } else {
        throw new Error('Error al actualizar el producto')
      }
    } catch (error) {
      toast.error('Error al actualizar el producto')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Cargando...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  if (!product) {
    return <div>Cargando...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Producto</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={product.nombre}
              onChange={(e) => setProduct({...product, nombre: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={product.descripcion}
              onChange={(e) => setProduct({...product, descripcion: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              value={product.precio}
              onChange={(e) => setProduct({...product, precio: parseFloat(e.target.value)})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existencias
            </label>
            <input
              type="number"
              value={product.existencias}
              onChange={(e) => setProduct({...product, existencias: parseInt(e.target.value)})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={product.categoria}
              onChange={(e) => setProduct({...product, categoria: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="facial">Cuidado Facial</option>
              <option value="corporal">Cuidado Corporal</option>
              <option value="cabello">Cuidado del Cabello</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                    <span>Subir archivos</span>
                    <input type="file" className="sr-only" multiple />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave />
            {isLoading ? 'Guardando...' : 'Actualizar Producto'}
          </button>
        </div>
      </form>
    </div>
  )
} 