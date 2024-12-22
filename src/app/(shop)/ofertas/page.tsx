import { prisma } from '@/lib/prisma'
import ProductCard from '@/app/components/products/ProductCard'


async function getOfertasProducts() {
  const products = await prisma.producto.findMany({
    where: {
      enOferta: true // Asumiendo que tienes este campo en tu modelo
    }
  })
  return products
}

export default async function OfertasPage() {
  const products = await getOfertasProducts()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ofertas Especiales</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  )
} 