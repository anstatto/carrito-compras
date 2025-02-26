'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { FaSearch, FaTrash } from "react-icons/fa"
import { toast } from "react-hot-toast"
import { Product } from '@/app/types'

interface ProductTableProps {
  products: Product[]
  onUpdate: (products: Product[]) => void
}

const getImageUrl = (url: string) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/productos/')) return url;
  return `/productos/${url}`;
};

export default function ProductTable({ products, onUpdate }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchProducts = async (term: string) => {
    if (!term) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(term)}`)
      if (!res.ok) throw new Error('Error en la búsqueda')
      
      const data = await res.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Error al buscar productos')
    } finally {
      setIsSearching(false)
    }
  }

  const addProduct = (product: Product) => {
    const existingProduct = products.find(p => p.id === product.id)
    
    if (existingProduct) {
      if (existingProduct.cantidad >= product.existencias) {
        toast.error(`Solo hay ${product.existencias} unidades disponibles`)
        return
      }
      
      onUpdate(products.map(p => 
        p.id === product.id 
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      ))
    } else {
      onUpdate([...products, { ...product, cantidad: 1 }])
    }
    
    setSearchTerm("")
    setSearchResults([])
  }

  const updateQuantity = (productId: string, newCantidad: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    if (newCantidad > product.existencias) {
      toast.error(`Solo hay ${product.existencias} unidades disponibles`)
      return
    }

    if (newCantidad < 1) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    onUpdate(products.map(p => 
      p.id === productId ? { ...p, cantidad: newCantidad } : p
    ))
  }

  const removeProduct = (productId: string) => {
    onUpdate(products.filter(p => p.id !== productId))
  }

  const formatPrice = (precio: string | number) => {
    const numPrice = typeof precio === 'string' ? parseFloat(precio) : precio;
    return numPrice.toFixed(2);
  };

  const getNumericPrice = (precio: string | number): number => {
    return typeof precio === 'string' ? parseFloat(precio) : precio;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            searchProducts(e.target.value)
          }}
          placeholder="Buscar productos por nombre o SKU..."
          className="w-full px-4 py-2 pl-10 border rounded-lg"
        />
        <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        
        {searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => addProduct(product)}
                  className="flex items-center gap-4 p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <Image
                    src={getImageUrl(product.imagenes[0]?.url)}
                    alt={product.nombre}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.png';
                    }}
                  />
                  <div>
                    <p className="font-medium">{product.nombre}</p>
                    <div className="text-sm text-gray-500 flex gap-2">
                      <span>RD${formatPrice(product.precio)}</span>
                      <span>•</span>
                      <span>Stock: {product.existencias}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio Unit.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subtotal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map(product => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Image
                    src={getImageUrl(product.imagenes[0]?.url)}
                    alt={product.nombre}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.png';
                    }}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.nombre}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={product.cantidad || 0}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                    updateQuantity(product.id, value);
                  }}
                  min="1"
                  className="w-20 px-2 py-1 border rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                RD${formatPrice(product.precio)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                RD${formatPrice(getNumericPrice(product.precio) * product.cantidad)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}