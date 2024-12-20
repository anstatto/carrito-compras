import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import CartButton from '@/app/components/cart/CartButton'

async function getProduct(id: string) {
  const product = await prisma.producto.findUnique({
    where: { id }
  })
  return product
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    return <div>Producto no encontrado</div>
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Arlin Glow Care</h1>
        <CartButton />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative h-96">
          <Image
            src={product.imagenes[0]}
            alt={product.nombre}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.nombre}</h1>
          <p className="text-2xl text-pink-600 font-semibold mb-4">
            ${product.precio.toFixed(2)}
          </p>
          <p className="text-gray-600 mb-6">{product.descripcion}</p>
          {/* Aquí puedes agregar más detalles del producto */}
        </div>
      </div>
    </main>
  )
} 