'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '@/app/hooks/useNotification'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { MarcaProducto } from '@prisma/client'
import { z } from 'zod'


// Creamos un nuevo hook para el localStorage
const CART_STORAGE_KEY = 'shopping-cart'

interface CartItem {
  id: string
  productoId: string
  nombre: string
  precio: number
  cantidad: number
  imagen: string
  marca: MarcaProducto
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => Promise<CartItem>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, cantidad: number) => Promise<void>
  total: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartItemResponse {
  id: string
  productoId: string
  cantidad: number
  producto: {
    nombre: string
    precio: number
    marca: MarcaProducto
    imagenes: {
      url: string
    }[]
  }
}

// Definir schemas de validación
const cartItemResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    productoId: z.string(),
    cantidad: z.number(),
    nombre: z.string(),
    precio: z.number(),
    marca: z.nativeEnum(MarcaProducto),
    imagen: z.string()
  })
})

const cartResponseSchema = z.object({
  success: z.boolean(),
  data: cartItemResponseSchema
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { showError, showSuccess } = useNotification()
  const queryClient = useQueryClient()
  
  const [localCart, setLocalCart] = useLocalStorage<CartItem[]>(CART_STORAGE_KEY, [])
  const localCartRef = useRef(localCart)

  useEffect(() => {
    localCartRef.current = localCart
  }, [localCart])

  const { data: serverCart = [], isLoading } = useQuery({
    queryKey: ['cart', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return []
      const response = await fetch('/api/cart')
      if (!response.ok) {
        const error = await response.json()
        showError('Error al cargar el carrito: ' + (error.message || 'Error desconocido'))
        throw new Error(error.message)
      }
      const data = await response.json()
      return data.map((item: CartItemResponse) => ({
        id: item.id,
        productoId: item.productoId,
        nombre: item.producto.nombre,
        precio: Number(item.producto.precio),
        cantidad: item.cantidad,
        imagen: item.producto.imagenes[0]?.url || '/images/placeholder.png',
        marca: item.producto.marca
      }))
    },
    enabled: !!session?.user,
    retry: 2,
    staleTime: 1000 * 60, // 1 minuto
    gcTime: 1000 * 60 * 5 // 5 minutos
  })

  const items = session?.user ? serverCart : localCart

  const addItemMutation = useMutation({
    mutationFn: async (newItem: Omit<CartItem, 'id'>) => {
      if (session?.user) {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            productoId: newItem.productoId,
            cantidad: newItem.cantidad
          })
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Error al agregar al carrito')
        }

        const validatedResponse = cartResponseSchema.safeParse(responseData)
        if (!validatedResponse.success) {
          console.error('Error de validación:', validatedResponse.error)
          throw new Error('Respuesta del servidor inválida')
        }

        return validatedResponse.data.data
      } else {
        const existingItem = localCart.find(item => item.productoId === newItem.productoId)
        const newCartItem = {
          ...newItem,
          id: existingItem?.id || crypto.randomUUID()
        }

        setLocalCart(prevCart => {
          if (existingItem) {
            return prevCart.map(item =>
              item.productoId === newItem.productoId
                ? { ...item, cantidad: item.cantidad + newItem.cantidad }
                : item
            )
          }
          return [...prevCart, newCartItem]
        })

        return newCartItem
      }
    },
    onSuccess: () => {
      showSuccess('¡Producto agregado al carrito!')
      if (session?.user) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
    },
    onError: (error: Error) => {
      console.error('Error en la mutación:', error)
      showError(error.message || 'Error al agregar al carrito')
    }
  })

  const removeItem = async (id: string) => {
    try {
      if (session?.user) {
        const response = await fetch(`/api/cart?itemId=${id}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Error al eliminar del carrito')
        }
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } else {
        setLocalCart(prevCart => prevCart.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error(error)
      showError('Error al eliminar del carrito')
    }
  }

  const updateQuantity = async (id: string, cantidad: number) => {
    try {
      const item = items.find((item: CartItem) => item.id === id)
      if (!item) return

      if (session?.user) {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productoId: item.productoId,
            cantidad
          })
        })
        if (!response.ok) {
          throw new Error('Error al actualizar cantidad')
        }
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } else {
        setLocalCart(prevCart => 
          prevCart.map(item => 
            item.id === id ? { ...item, cantidad } : item
          )
        )
      }
    } catch (error) {
      console.error(error)
      showError('Error al actualizar cantidad')
    }
  }

  const total = items.reduce((sum: number, item: CartItem) => sum + (item.precio * item.cantidad), 0)

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem: async (item) => {
        const result = await addItemMutation.mutateAsync(item);
        if ('data' in result) {
          return result.data;
        }
        return result;
      },
      removeItem,
      updateQuantity,
      total,
      loading: isLoading || addItemMutation.isPending
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 