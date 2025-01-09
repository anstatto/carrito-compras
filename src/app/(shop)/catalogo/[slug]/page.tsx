import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductCard from '@/app/components/products/ProductCard'
import type { Metadata } from 'next'
import { ProductView } from '@/interfaces/Product'

export const metadata: Metadata = {
  title: 'Catálogo - Arlin Glow Care',
  description: 'Explora nuestra colección de productos de belleza y cuidado personal'
}

async function getCategoryWithProducts(slug: string) {
  const category = await prisma.categoria.findUnique({
    where: { 
      slug,
      activa: true 
    },
    include: {
      productos: {
        where: { activo: true },
        orderBy: { creadoEl: 'desc' },
        include: {
          imagenes: {
            select: {
              url: true,
              alt: true
            }
          }
        }
      }
    }
  })

  if (!category) notFound()
  return category
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryWithProducts(params.slug)

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.nombre}</h1>
          {category.descripcion && (
            <p className="text-gray-600">{category.descripcion}</p>
          )}
        </div>

      </div>

      {/* Grid de productos */}
      {category.productos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No hay productos disponibles en esta categoría por el momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {category.productos.map((product) => (
            <ProductCard key={product.id} product={{
              id: product.id,
              nombre: product.nombre,
              descripcion: product.descripcion,
              precio: Number(product.precio),
              precioOferta: product.precioOferta ? Number(product.precioOferta) : null,
              enOferta: product.enOferta,
              imagenes: product.imagenes?.map(img => ({
                url: img.url,
                alt: img.alt || product.nombre
              })) || [],
              slug: product.slug,
              categoria: {
                id: category.id,
                nombre: category.nombre,
                slug: category.slug
              },
              existencias: product.existencias
            } satisfies ProductView} />
          ))}
        </div>

      )}
    </main>
  )
} 