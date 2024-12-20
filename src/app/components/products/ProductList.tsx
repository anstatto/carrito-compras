import ProductCard from './ProductCard'
import { prisma } from '@/lib/prisma'

async function getProducts() {
  const products = await prisma.producto.findMany({
    take: 8, // Limita a 8 productos
  })
  return products
}

export default async function ProductList() {
  const products = await getProducts()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
