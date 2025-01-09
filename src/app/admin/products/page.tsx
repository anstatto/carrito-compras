'use client'

import { useEffect, useState } from 'react'
import { ProductFilters } from './_components/ProductFilters'
import { FaEdit, FaEye, FaEyeSlash, FaPlus, FaSort, FaStar } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Product } from '@/interfaces/Product'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { toast } from 'react-hot-toast'

export default function ProductsPage() {
  const { products, isLoading, fetchProducts, updateProduct } = useProducts()
  const [categories, setCategories] = useState([])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortField, setSortField] = useState<'nombre' | 'precio' | 'existencias'>('nombre')
  const router = useRouter()
  
  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await updateProduct(productId, { 
        activo: !currentStatus 
      })
      
      if (!response) throw new Error('Error al actualizar estado')
      
      toast.success(`Producto ${currentStatus ? 'desactivado' : 'activado'} correctamente`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado del producto')
    }
  }

  const toggleOfferStatus = async (productId: string, product: Product) => {
    try {
      const response = await updateProduct(productId, {
        enOferta: !product.enOferta,
        precioOferta: !product.enOferta && product.precioOferta 
          ? Number(product.precioOferta) 
          : undefined
      })

      if (!response) throw new Error('Error al actualizar oferta')
      
      toast.success(`Oferta ${!product.enOferta ? 'activada' : 'desactivada'} correctamente`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar la oferta del producto')
    }
  }

  const toggleDestacado = async (productId: string, product: Product) => {
    try {
      const response = await updateProduct(productId, {
        destacado: !product.destacado
      })

      if (!response) throw new Error('Error al actualizar destacado')
      
      toast.success(`Producto ${!product.destacado ? 'destacado' : 'quitado de destacados'} correctamente`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado destacado del producto')
    }
  }

  const handleDoubleClick = (productId: string) => {
    router.push(`/admin/products/${productId}`)
  }

  useEffect(() => {
    const handleFocus = () => {
      fetchProducts()
    }

    window.addEventListener('focus', handleFocus)
    fetchProducts()
    fetch('/api/categories').then(res => res.json()).then(setCategories)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchProducts])

  // Función mejorada para ordenar productos
  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      if (sortField === 'precio') {
        return sortOrder === 'asc' ? Number(a.precio) - Number(b.precio) : Number(b.precio) - Number(a.precio)
      }
      if (sortField === 'existencias') {
        return sortOrder === 'asc' ? a.existencias - b.existencias : b.existencias - a.existencias
      }
      return sortOrder === 'asc' 
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre)
    })
  }

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 
                   text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <FaPlus /> Nuevo Producto
        </Link>
      </div>

      <ProductFilters 
        categories={categories}
        onFilter={fetchProducts}
      />

      {/* Controles de ordenamiento */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => handleSort('nombre')}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors
                     ${sortField === 'nombre' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
        >
          Nombre <FaSort className={sortField === 'nombre' ? 'text-pink-600' : 'text-gray-400'} />
        </button>
        <button
          onClick={() => handleSort('precio')}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors
                     ${sortField === 'precio' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
        >
          Precio <FaSort className={sortField === 'precio' ? 'text-pink-600' : 'text-gray-400'} />
        </button>
        <button
          onClick={() => handleSort('existencias')}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors
                     ${sortField === 'existencias' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
        >
          Stock <FaSort className={sortField === 'existencias' ? 'text-pink-600' : 'text-gray-400'} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortProducts(products).map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                onDoubleClick={() => handleDoubleClick(product.id)}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 
                           hover:shadow-xl cursor-pointer relative
                           ${!product.activo && 'opacity-75'}`}
              >
                {/* Badges de estado */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                  {product.enOferta && (
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 
                                  text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      {((1 - Number(product.precioOferta) / Number(product.precio)) * 100).toFixed(0)}% OFF
                    </div>
                  )}
                  {product.destacado && (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 
                                  text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      Destacado
                    </div>
                  )}
                  {!product.activo && (
                    <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      Inactivo
                    </div>
                  )}
                </div>

                <div className="relative aspect-video">
                  <OptimizedImage
                    src={product.imagenes[0]?.url || '/placeholder-product.jpg'}
                    alt={product.nombre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {product.nombre}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProductStatus(product.id, product.activo)
                        }}
                        className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                        title={product.activo ? 'Desactivar' : 'Activar'}
                      >
                        {product.activo ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleOfferStatus(product.id, product)
                        }}
                        className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                        title={product.enOferta ? 'Quitar oferta' : 'Poner en oferta'}
                      >
                        {product.enOferta ? '💰' : '🏷️'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDestacado(product.id, product)
                        }}
                        className={`p-2 transition-colors ${
                          product.destacado 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-500 hover:text-yellow-500'
                        }`}
                        title={product.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                      >
                        <FaStar />
                      </button>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                      >
                        <FaEdit />
                      </Link>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.descripcion}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      {product.enOferta && product.precioOferta ? (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-pink-500">
                              ${Number(product.precioOferta).toFixed(2)}
                            </p>
                            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                              Oferta
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-through">
                            ${Number(product.precio).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          ${Number(product.precio).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.existencias <= product.stockMinimo 
                          ? 'text-red-500' 
                          : product.existencias <= product.stockMinimo * 2
                            ? 'text-amber-500'
                            : 'text-green-500'
                      }`}>
                        Stock: {product.existencias}
                      </p>
                      {product.existencias <= product.stockMinimo && (
                        <p className="text-xs text-red-500">
                          ¡Stock bajo!
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      {product.categoria.nombre}
                    </span>
                    <span className="text-xs text-gray-400">
                      SKU: {product.sku}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      )}
    </div>
  )
}