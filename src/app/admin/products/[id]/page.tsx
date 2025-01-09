'use client'

import { useEffect, useState } from 'react'
import { FaArrowLeft, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import type { Product } from '@/interfaces/Product'
import { OptimizedImage } from '@/components/OptimizedImage'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
}

export default function ShowProductPage({ params }: Props) {
  const id = React.use(params).id
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error('Error al cargar producto')
        const data = await res.json()
        setProduct(data)
      } catch (error) {
        toast.error('Error al cargar el producto')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      setIsLoading(true)
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al eliminar producto')
      }
      
      toast.success('Producto eliminado correctamente')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async () => {
    if (!product) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          activo: !product.activo 
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al actualizar estado')
      }

      const updatedProduct = await res.json()
      setProduct(updatedProduct)
      toast.success(updatedProduct.activo ? 'Producto activado' : 'Producto desactivado')
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

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Producto no encontrado</h2>
        <Link 
          href="/admin/products"
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
            href="/admin/products" 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Detalles del Producto</h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleStatus}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-all ${
              product.activo 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={product.activo ? 'Desactivar producto' : 'Activar producto'}
          >
            {product.activo ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
          </motion.button>

          <Link
            href={`/admin/products/${product.id}/edit`}
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
            title="Eliminar producto"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
              <p className="text-lg font-semibold text-gray-900">{product.nombre}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Categoría</h3>
              <p className="text-lg font-semibold text-gray-900">{product.categoria.nombre}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Precio</h3>
              <p className="text-lg font-semibold text-pink-600">${product.precio}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Stock</h3>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold text-gray-900">{product.existencias} unidades</p>
                {product.existencias <= product.stockMinimo && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    Stock bajo
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">SKU</h3>
              <p className="text-lg font-semibold text-gray-900">{product.sku}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{product.descripcion}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Imágenes</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.imagenes.map((imagen, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <OptimizedImage
                      src={imagen.url}
                      alt={imagen.alt || `${product.nombre} - Imagen ${index + 1}`}
                      priority={index === 0}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="transition-transform group-hover:scale-110"
                      fill={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h3 className="text-gray-500 font-medium">Estado</h3>
              <p className={`mt-1 font-semibold ${product.activo ? 'text-green-600' : 'text-red-600'}`}>
                {product.activo ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Stock Mínimo</h3>
              <p className="mt-1 font-semibold text-gray-900">{product.stockMinimo} unidades</p>
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Creado</h3>
              <p className="mt-1 font-semibold text-gray-900">
                {new Date(product.creadoEl).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-gray-500 font-medium">Última actualización</h3>
              <p className="mt-1 font-semibold text-gray-900">
                {new Date(product.actualizadoEl).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 