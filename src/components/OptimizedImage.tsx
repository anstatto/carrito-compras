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

const CLOUDINARY_URL = 'https://res.cloudinary.com/dwga2dsbz/image/upload'

export default function OptimizedImage({
  src,
  alt,
  width = 500,
  height = 500,
  className = '',
  priority = false,
  fill = false,
  sizes
}: OptimizedImageProps) {
  if (!src) return null

  // Si ya es una URL completa de Cloudinary, la usamos tal cual
  // Si es una ruta parcial, construimos la URL completa
  const imageUrl = src.startsWith('http') 
    ? src 
    : src.startsWith('/v1') 
      ? `${CLOUDINARY_URL}${src}`
      : src.startsWith('/productos') 
        ? `${CLOUDINARY_URL}/v1741054256${src}`
        : src

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      fill={fill}
      sizes={sizes}
    />
  )
} 