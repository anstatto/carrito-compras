import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useNotification } from './useNotification'

export function useFavorites() {
  const { data: session } = useSession()
  const { showSuccess, showError } = useNotification()
  const queryClient = useQueryClient()

  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favorites', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return []
      const response = await fetch('/api/favorites')
      if (!response.ok) throw new Error('Error al cargar favoritos')
      return response.json()
    },
    enabled: !!session?.user
  })

  const toggleFavorite = useMutation({
    mutationFn: async (productoId: string) => {
      try {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productoId })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Error al actualizar favoritos')
        }

        return response.json()
      } catch (error) {
        throw error instanceof Error ? error : new Error('Error desconocido')
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      showSuccess(data.message || 'Favoritos actualizados')
    },
    onError: (error: Error) => {
      showError(error.message)
    }
  })

  return {
    favorites,
    isLoading: isLoadingFavorites || toggleFavorite.isPending,
    toggleFavorite: toggleFavorite.mutate,
    isInFavorites: (productoId: string) => 
      favorites.some((fav: { productoId: string }) => fav.productoId === productoId)
  }
} 