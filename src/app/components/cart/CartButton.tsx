'use client'

import { useCart } from '@/app/context/CartContext'
import { FaShoppingCart } from 'react-icons/fa'
import Link from 'next/link'

export default function CartButton() {
  const { totalItems } = useCart()

  return (
    <Link 
      href="/carrito" 
      className="relative p-2 hover:text-pink-500 transition-colors"
    >
      <FaShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  )
} 