import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import AddToCartButton from '@/app/components/cart/AddToCartButton'
import ProductImageGallery from '@/app/components/products/ProductImageGallery'
import ProductInfo from '@/app/components/products/ProductInfo'
import Loading from './loading'

interface PageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { 
        slug: id,
        activo: true 
      },
      include: {
        categoria: true,
        imagenes: {
          orderBy: {
            orden: 'asc'
          }
        }
      }
    })

    if (!producto) return null
    return producto
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return null
  }
}

export default async function ProductPage({ params }: PageProps) {
  const id = await Promise.resolve(params.id)
  const producto = await getProduct(id)

  if (!producto) {
    notFound()
  }

  const imageUrls = producto.imagenes.map(img => ({
    url: img.url,
    alt: img.alt || producto.nombre
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImageGallery 
            images={imageUrls}
            name={producto.nombre}
          />
          
          <ProductInfo 
            producto={{
              nombre: producto.nombre,
              descripcion: producto.descripcion,
              precio: Number(producto.precio),
              precioOferta: producto.precioOferta ? Number(producto.precioOferta) : null,
              enOferta: producto.enOferta,
              marca: producto.marca,
              existencias: producto.existencias,
              categoria: {
                nombre: producto.categoria.nombre
              }
            }}
            addToCartButton={
              producto.existencias > 0 ? (
                <AddToCartButton product={{
                  id: producto.id,
                  nombre: producto.nombre,
                  precio: Number(producto.precio),
                  imagen: producto.imagenes[0]?.url || '',
                }} />
              ) : (
                <p className="text-red-600">Producto agotado</p>
              )
            }
          />
        </div>
      </Suspense>
    </div>
  )
} 