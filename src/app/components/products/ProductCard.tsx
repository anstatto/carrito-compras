import Image from 'next/image'
import Link from 'next/link'

type ProductCardProps = {
  product: {
    id: string
    nombre: string
    precio: number
    imagenes: string[]
    descripcion: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-64">
        <Image
          src={product.imagenes[0]}
          alt={product.nombre}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.nombre}</h3>
        <p className="text-pink-600 font-medium mt-1">
          ${product.precio.toFixed(2)}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 text-center bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  )
}
