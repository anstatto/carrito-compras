import Image from 'next/image'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/app/components/cart/AddToCartButton'
import { Suspense } from 'react'
import ProductImageGallery from '@/app/components/products/ProductImageGallery'
import ProductInfo from '@/app/components/products/ProductInfo'
import Loading from './loading'

interface PageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/productos/${id}`, {
      next: { 
        revalidate: 60,
        tags: ['producto']
      }
    })

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error('Error al cargar el producto')
    }

    return res.json()
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  console.log("Buscando producto con ID:", id);

  const producto = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`)
    .then(res => {
      if (!res.ok) {
        if (res.status === 404) {
          console.error('Producto no encontrado');
          return null;
        }
        throw new Error('Error al cargar el producto');
      }
      return res.json();
    })
    .catch(error => {
      console.error('Error al obtener el producto:', error);
      return null;
    });

  if (!producto) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImageGallery 
            images={producto.imagenes} 
            name={producto.nombre} 
          />
          
          <ProductInfo 
            producto={producto}
            addToCartButton={<AddToCartButton product={producto} />}
          />
        </div>
      </Suspense>
    </div>
  )
}

// Generar rutas estáticas para productos populares
export async function generateStaticParams() {
  try {
    const productos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos/populares`).then(res => res.json())
    return productos.map((producto: { id: string }) => ({
      id: producto.id
    }))
  } catch (error) {
    return []
  }
} 