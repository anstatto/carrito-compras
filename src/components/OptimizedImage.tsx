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
  priority = false,
  fill = false,
  sizes
}: OptimizedImageProps) {
  if (!src) return null

  return (
    <Image
      src={src}
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