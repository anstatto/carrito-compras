import { prisma } from '@/lib/prisma'
import { FaStar, FaShoppingBag } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

// Loader personalizado para reemplazar react-loader-spinner
function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-500"></div>
    </div>
  )
}

async function getProducts() {
  try {
    const products = await prisma.producto.findMany({
      where: { activo: true },
      take: 8,
      orderBy: { creadoEl: 'desc' }
    })
    return products
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

export default async function ProductList() {
  const products = await getProducts()

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link 
          key={product.id}
          href={`/productos/${product.slug}`}
          className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          {/* Imagen del producto */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.imagenes[0] || '/images/placeholder.png'}
              alt={product.nombre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.enOferta && (
              <span className="absolute top-2 right-2 bg-pink-500 text-white text-sm px-3 py-1 rounded-full">
                Oferta
              </span>
            )}
          </div>

          {/* Información del producto */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors">
              {product.nombre}
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900">
                  ${product.precio.toFixed(2)}
                </span>
                {product.enOferta && product.precioOferta && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ${product.precioOferta.toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Indicador de stock */}
              {product.existencias > 0 ? (
                <span className="text-sm text-green-500">En stock</span>
              ) : (
                <span className="text-sm text-red-500">Agotado</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
