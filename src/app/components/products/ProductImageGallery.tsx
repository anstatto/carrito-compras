import Image from 'next/image'

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export default function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-square">
        <Image
          src={images[0] || '/placeholder.png'}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover rounded-lg"
          priority
        />
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1).map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt={`${name} - ${index + 2}`}
                fill
                sizes="(max-width: 768px) 25vw, 12vw"
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 