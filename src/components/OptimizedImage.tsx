import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export default function OptimizedImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = '',
  priority = false
}: OptimizedImageProps) {
  // Validar que src no sea undefined
  if (!src) {
    console.error('OptimizedImage: src prop is required')
    return null
  }

  try {
    // Asegurarse de que src comience con una barra si es una ruta relativa
    const imageSrc = src.startsWith('http') || src.startsWith('/') 
      ? src 
      : `/${src}`

    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    )
  } catch (error) {
    console.error('OptimizedImage: Error loading image:', error)
    return null
  }
} 