import Pagination from '../ui/Pagination'
import ProductCard from './ProductCard'


type Product = {
  id: string
  nombre: string
  precio: number
  imagenes: string[]
  descripcion: string
  categoria: {
    id: string
    nombre: string
  }
}

type ProductGridProps = {
  products: Product[]
  total: number
  currentPage: number
  itemsPerPage: number
}

export default function ProductGrid({ 
  products, 
  total, 
  currentPage, 
  itemsPerPage 
}: ProductGridProps) {
  const totalPages = Math.ceil(total / itemsPerPage)

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">
          No se encontraron productos con los filtros seleccionados
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />
    </div>
  )
} 