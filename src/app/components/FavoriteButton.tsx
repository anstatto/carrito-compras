'use client'

import { useFavorites } from '@/app/hooks/useFavorites'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface FavoriteButtonProps {
  productoId: string
  className?: string
}

export default function FavoriteButton({ productoId, className = '' }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isInFavorites, toggleFavorite, isLoading } = useFavorites()
  const isFavorite = isInFavorites(productoId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir navegación en caso de estar dentro de un Link
    
    if (!session) {
      router.push('/login?redirect=/favoritos')
      return
    }
    
    toggleFavorite(productoId)
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      disabled={isLoading}
      className={`
        p-2 rounded-full transition-colors duration-300 relative group
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="animate-spin">
          <FaHeart className="w-6 h-6 text-gray-400" />
        </div>
      ) : isFavorite ? (
        <FaHeart className="w-6 h-6 text-pink-500" />
      ) : (
        <FaRegHeart className="w-6 h-6 text-gray-400 group-hover:text-pink-500 
                              transition-colors duration-300" />
      )}
      
      {!session && (
        <span className="absolute -bottom-2 right-0 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </motion.button>
  )
} 