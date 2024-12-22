import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import AddToCartButton from '@/app/components/cart/AddToCartButton'

async function getProduct(id: string) {
  const product = await prisma.producto.findUnique({
    where: { id },
    include: {
      categoria: true,
    },
  })
  return product
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    return <div className="text-center py-12 dark:text-gray-300">Producto no encontrado</div>
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Arlin Glow Care
        </h1>

      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <Image
            src={product.imagenes[0]}
            alt={product.nombre}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {product.nombre}
          </h1>
          
          <p className="text-2xl font-semibold text-pink-600 dark:text-pink-400">
            ${product.precio.toFixed(2)}
          </p>
          
          <p className="text-gray-600 dark:text-gray-300">
            {product.descripcion}
          </p>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Categorías
            </h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              {product.categoria && (
                <li key={product.categoria.id}>
                  {product.categoria.nombre}
                </li>
              )}
            </ul>
          </div>

          <AddToCartButton product={{...product, imagen: product.imagenes[0]}} />
        </div>
      </div>
    </main>
  )
} 