import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import ProductContent from '@/app/components/products/ProductContent'
import Loading from './loading'
import type { Metadata } from 'next'

// Función segura para obtener el producto
async function getProductById(id: string) {
  'use server'
  try {
    return await prisma.producto.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        activo: true
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true
          }
        },
        imagenes: {
          select: {
            url: true,
            alt: true,
            orden: true
          },
          orderBy: {
            orden: 'asc'
          }
        }
      }
    })
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return null
  }
}

// Generar metadatos
export async function generateMetadata({
  params 
}: {
  params: { id: string }
}): Promise<Metadata> {
  'use server'
  const { id } = await params
  const producto = await getProductById(id)

  if (!producto) {
    return {
      title: 'Producto no encontrado',
      robots: { index: false, follow: true }
    }
  }

  return {
    title: `${producto.nombre} - Arlin Glow Care`,
    description: producto.descripcion || 'Detalles del producto en Arlin Glow Care',
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion,
      images: producto.imagenes[0]?.url ? [producto.imagenes[0].url] : []
    }
  }
}

// Página del producto
export default async function ProductPage({
  params 
}: {
  params: { id: string }
}) {
  'use server'
  const { id } = await params
  const productoRaw = await getProductById(id)

  if (!productoRaw) {
    notFound()
  }

  const producto = {
    ...productoRaw,
    precio: Number(productoRaw.precio),
    precioOferta: productoRaw.precioOferta ? Number(productoRaw.precioOferta) : null,
    creadoEl: productoRaw.creadoEl.toISOString(),
    actualizadoEl: productoRaw.actualizadoEl.toISOString(),
    imagenes: productoRaw.imagenes.map(img => ({
      ...img,
      alt: img.alt || productoRaw.nombre
    }))
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <Suspense fallback={<Loading />}>
        <ProductContent producto={producto} />
      </Suspense>
    </main>
  )
}