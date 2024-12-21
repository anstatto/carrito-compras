'use client'

import { useCart } from '@/app/context/CartContext'
import { useNotification } from '@/app/hooks/useNotification'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import { useState } from 'react'

type Product = {
  id: string
  nombre: string
  precio: number
  imagen: string
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { showSuccess } = useNotification()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    addItem({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: 1,
      imagen: product.imagen
    })

    showSuccess('¡Producto agregado al carrito!')
    
    // Resetear el estado después de una breve animación
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`
        group relative flex items-center justify-center gap-2 
        px-6 py-3 rounded-full font-medium
        transition-all duration-300 ease-in-out
        ${isAdding ? 
          'bg-green-500 text-white w-[120px]' : 
          'bg-pink-500 hover:bg-pink-600 text-white hover:shadow-lg hover:shadow-pink-500/25'
        }
      `}
    >
      <span className={`
        flex items-center gap-2
        transform transition-transform duration-300
        ${isAdding ? 'scale-0' : 'scale-100'}
      `}>
        <FaShoppingCart className="w-4 h-4" />
        Agregar
      </span>

      <span className={`
        absolute flex items-center gap-2
        transform transition-transform duration-300
        ${isAdding ? 'scale-100' : 'scale-0'}
      `}>
        <FaCheck className="w-4 h-4" />
        ¡Listo!
      </span>

      {/* Efecto de onda al hacer click */}
      <span className="absolute inset-0 h-full w-full rounded-full" />
    </button>
  )
} 