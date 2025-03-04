'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { ProductFilters } from './_components/ProductFilters'
import { FaEdit, FaEye, FaEyeSlash, FaPlus, FaSort, FaStar } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Product } from '@/interfaces/Product'
import OptimizedImage from '@/components/OptimizedImage'
import { useProducts } from '@/hooks/useProducts'
import { toast } from 'react-hot-toast'
import Pagination from '@/components/ui/Pagination'
import { useRouter, usePathname } from 'next/navigation'
import type { FilterParams } from '@/interfaces/FilterParams'

// Animaciones para las tarjetas
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
}

export default function ProductsPage() {
  const { products, isLoading, fetchProducts, updateProduct, setProducts } = useProducts()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [categories, setCategories] = useState([])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortField, setSortField] = useState<'nombre' | 'precio' | 'existencias'>('nombre')
  const [searchTerm, setSearchTerm] = useState('')

  const router = useRouter()
  const pathname = usePathname()

  // Memoizar el ordenamiento y filtrado de productos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product => 
        (product.nombre && product.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Ordenar productos
    return filtered.sort((a, b) => {
      const aValue = sortField === 'precio' ? Number(a[sortField]) : a[sortField]
      const bValue = sortField === 'precio' ? Number(b[sortField]) : b[sortField]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue, 'es', { sensitivity: 'base' })
          : bValue.localeCompare(aValue, 'es', { sensitivity: 'base' })
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })
  }, [products, sortField, sortOrder, searchTerm])

  // Paginación
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await updateProduct(productId, { activo: !currentStatus })
      if (!response) throw new Error('Error al actualizar estado')
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, activo: !currentStatus }
            : product
        )
      )
      
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
      fetchProducts() // Recargar productos para obtener el nuevo precio de oferta
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
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId 
            ? { ...p, destacado: !p.destacado }
            : p
        )
      )
      
      toast.success(`Producto ${!product.destacado ? 'destacado' : 'quitado de destacados'} correctamente`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado destacado del producto')
    }
  }

  const handleDoubleClick = (productId: string) => {
    router.push(`/admin/products/${productId}/edit`)
  }

  useEffect(() => {
    const handleFocus = () => fetchProducts()
    window.addEventListener('focus', handleFocus)
    
    fetchProducts()
    
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Error al cargar categorías')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al cargar las categorías')
      }
    }
    
    loadCategories()

    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, [pathname, fetchProducts])

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Manejar cambios en los filtros
  const handleFilter = useCallback((filters: FilterParams) => {
    setCurrentPage(1) // Reset página al filtrar
    fetchProducts(filters)
  }, [fetchProducts])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 
                     text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaPlus /> Nuevo Producto
          </Link>
        </div>
      </div>

      <ProductFilters 
        categories={categories}
        onFilter={handleFilter}
      />

      {/* Controles de ordenamiento */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow">
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
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map(product => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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

                  <div className="relative h-[250px] bg-white p-4">
                    <OptimizedImage
                      src={product.imagenes[0]?.url || '/placeholder-product.jpg'}
                      alt={product.nombre || 'Imagen del producto'}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={true}
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
                          className={`p-2 transition-colors ${
                            product.enOferta 
                              ? 'text-pink-500 hover:text-pink-600' 
                              : 'text-gray-500 hover:text-pink-500'
                          }`}
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
                                RD${Number(product.precioOferta).toLocaleString('es-DO')}
                              </p>
                              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                                Oferta
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-through">
                              RD${Number(product.precio).toLocaleString('es-DO')}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-gray-900">
                            RD${Number(product.precio).toLocaleString('es-DO')}
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

          {/* Paginación */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {filteredAndSortedProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm 
                  ? 'No se encontraron productos que coincidan con la búsqueda'
                  : 'No se encontraron productos'
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}