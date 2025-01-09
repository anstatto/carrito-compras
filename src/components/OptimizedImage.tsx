import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
  onClick?: () => void
  width?: number
  height?: number
}

export function OptimizedImage({
  src,
  alt,
  fill = true,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className = '',
  onClick,
  width,
  height
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!fill && (!width || !height)) {
    console.warn('OptimizedImage: When fill is false, width and height are required')
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-100 animate-pulse rounded-inherit"
          />
        )}
      </AnimatePresence>
      
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={fill ? sizes : undefined}
        priority={priority}
        quality={85}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onClick={onClick}
      />
    </div>
  )
} 