'use client'

import { useCart } from '@/app/context/CartContext'
import { useNotification } from '@/app/hooks/useNotification'

export default function AddToCartButton({ product }: { product: any }) {
  const { addItem } = useCart()
  const { showSuccess } = useNotification()

  const handleAddToCart = () => {
    addItem(product)
    showSuccess('¡Producto agregado al carrito!')
  }

  return (
    <button 
      onClick={handleAddToCart}
      className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
    >
      Agregar al carrito
    </button>
  )
} 