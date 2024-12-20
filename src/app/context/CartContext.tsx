'use client'
import { createContext, useContext, useState } from 'react'

type CartItem = {
  id: string
  nombre: string
  precio: number
  cantidad: number
  imagen: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, cantidad: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: CartItem) => {
    setItems(current => {
      const existingItem = current.find(item => item.id === product.id)
      if (existingItem) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...current, { ...product, cantidad: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems(current => current.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, cantidad: number) => {
    setItems(current =>
      current.map(item =>
        item.id === productId ? { ...item, cantidad } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 