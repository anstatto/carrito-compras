'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageType {
  url: string
  alt: string
}

interface Props {
  images: ImageType[]
  name: string
}

export default function ProductImageGallery({ images, name }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images.length) {
    return (
      <div className="aspect-square relative bg-gray-100 rounded-lg">
        <Image
          src="/placeholder-product.jpg"
          alt={name}
          fill
          className="object-cover rounded-lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square relative bg-gray-100 rounded-lg">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative bg-gray-100 rounded-lg overflow-hidden ${
                selectedImage === index ? 'ring-2 ring-pink-500' : ''
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 