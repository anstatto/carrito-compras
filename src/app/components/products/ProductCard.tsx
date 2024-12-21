'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/app/context/CartContext'
import { FaCartPlus } from 'react-icons/fa'
import AddToCartButton from '../cart/AddToCartButton'

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
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: 1,
      imagen: product.imagenes[0]
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4 max-w-sm">
      <div className="relative h-64">
        <Image
          src={product.imagenes[0]}
          alt={product.nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={true}
          className="object-cover"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.nombre}</h3>
        <p className="text-pink-600 font-medium mt-1">
          ${product.precio.toFixed(2)}
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 text-center btn-secondary"
          >
            Ver detalles
          </Link>
          <AddToCartButton product={{...product, imagen: product.imagenes[0]}} />
        </div>
      </div>
    </div>
  )
}
