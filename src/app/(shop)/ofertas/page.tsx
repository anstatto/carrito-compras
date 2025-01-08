import { prisma } from '@/lib/prisma'
import ProductCard from '@/app/components/products/ProductCard'

async function getOfertasProducts() {
  const products = await prisma.producto.findMany({
    where: {
      enOferta: true
    },
    include: {
      imagenes: true,
      categoria: true
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
          <ProductCard 
            key={product.id} 
            product={{
              id: product.id,
              nombre: product.nombre,
              descripcion: product.descripcion,
              categoria: {
                id: product.categoria.id,
                nombre: product.categoria.nombre,
                slug: product.categoria.slug
              },
              precio: Number(product.precio),
              precioOferta: Number(product.precioOferta),
              enOferta: product.enOferta,
              slug: product.slug,
              imagenes: product.imagenes.map(img => ({
                url: img.url,
                alt: product.nombre || null
              }))
            }} 
          />
        ))}
      </div>
    </main>
  )
} 