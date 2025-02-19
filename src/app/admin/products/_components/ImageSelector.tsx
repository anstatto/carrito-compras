'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, memo } from 'react'
import Image from 'next/image'
import { FaPlus, FaTimes, FaImages } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ProductImage } from '@/interfaces/Product'
import { Portal } from '@/components/Portal'

// Cargar GalleryPage dinámicamente
const GalleryPage = dynamic(() => import('../../_components/galeria/Gallery'), {
  loading: () => <div>Cargando galería...</div>,
  ssr: false
})

// Memoizar el botón de subida
const UploadButton = memo(({ 
  isUploading, 
  onFileSelect 
}: { 
  isUploading: boolean
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <label className="px-4 py-2 text-sm bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 rounded-lg cursor-pointer">
    <input
      type="file"
      multiple
      accept="image/*"
      className="hidden"
      onChange={onFileSelect}
      disabled={isUploading}
    />
    {isUploading ? (
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"
      />
    ) : (
      <>
        <FaPlus className="w-4 h-4" />
        <span>Subir</span>
      </>
    )}
  </label>
))
UploadButton.displayName = 'UploadButton'

interface ImageSelectorProps {
  currentImages: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
}

const ImagePreview = memo(({ 
  image, 
  index, 
  onRemove 
}: { 
  image: ProductImage
  index: number
  onRemove: (index: number) => void 
}) => {
  // Asegurar que la URL sea válida y completa
  const imageUrl = image.url.includes('/productos/') 
    ? image.url 
    : `/productos/${image.url.split('/').pop()}`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-square group"
    >
      <Image
        src={imageUrl}
        alt={image.alt || `Producto ${index + 1}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover rounded-lg"
      />
      <RemoveButton onRemove={() => onRemove(index)} />
    </motion.div>
  )
})

ImagePreview.displayName = 'ImagePreview'

const RemoveButton = memo(({ onRemove }: { onRemove: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onRemove}
    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all"
  >
    <FaTimes size={12} />
  </motion.button>
))

RemoveButton.displayName = 'RemoveButton'

export const ImageSelector = memo(function ImageSelector({ 
  currentImages, 
  onImagesChange 
}: ImageSelectorProps) {
  const [showGallery, setShowGallery] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const newImages = [...currentImages]

      for (const file of files) {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('module', 'productos')
        
        // Limpiar nombre de archivo
        const cleanFileName = file.name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9._-]/g, '')
        
        const timestamp = Date.now()
        const finalFileName = `${cleanFileName.replace(/\.[^/.]+$/, '')}_${timestamp}`
        
        formData.append('name', finalFileName)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!res.ok) throw new Error('Error al subir imagen')
        
        const data = await res.json()
        
        // Asegurar que la URL sea correcta
        const imageUrl = `/productos/${data.url.split('/').pop()}`

        newImages.push({ 
          url: imageUrl,
          alt: cleanFileName.replace(/[_-]/g, ' ').replace(/\.[^/.]+$/, '') || 'Imagen de producto'
        })
      }

      onImagesChange(newImages)
      toast.success('Imágenes subidas correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al subir las imágenes')
    } finally {
      setIsUploading(false)
    }
  }, [currentImages, onImagesChange])

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Imágenes del Producto
        </label>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGallery(true)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 rounded-lg"
          >
            <FaImages className="w-4 h-4" />
            <span>Galería</span>
          </motion.button>
          <UploadButton 
            isUploading={isUploading} 
            onFileSelect={handleFileSelect}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {currentImages.map((image, index) => (
          <ImagePreview 
            key={image.url}
            image={image}
            index={index}
            onRemove={handleRemoveImage}
          />
        ))}
      </div>

      <AnimatePresence>
        {showGallery && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowGallery(false)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col"
              >
                <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                  <h3 className="text-lg font-semibold">Seleccionar Imagen</h3>
                  <button 
                    onClick={() => setShowGallery(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <GalleryPage 
                    onImageSelect={(url) => {
                      onImagesChange([...currentImages, { url, alt: '' }])
                      setShowGallery(false)
                    }}
                    selectionMode={true}
                  />
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  )
}) 