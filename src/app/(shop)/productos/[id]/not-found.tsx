import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

export default function ProductNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Producto no encontrado
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        El producto que buscas no existe o no está disponible.
      </p>
      <Link
        href="/catalogo"
        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>
    </div>
  )
} 