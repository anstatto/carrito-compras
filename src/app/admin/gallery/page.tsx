'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrash, FaEdit, FaSearch, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ImageFile {
  name: string
  url: string
  module: string
  size: number
  createdAt: string
  type: string
}

const ITEMS_PER_PAGE = 20

interface GalleryPageProps {
  onImageSelect?: (imageUrl: string) => void
  selectionMode?: boolean
}

export default function GalleryPage({ onImageSelect, selectionMode = false }: GalleryPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [images, setImages] = useState<ImageFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingImage, setEditingImage] = useState<ImageFile | null>(null)
  const [newName, setNewName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchImages()
  }, [session, status, router])

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/gallery')
      if (!res.ok) throw new Error('Error al cargar imágenes')
      const data = await res.json()
      setImages(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar imágenes')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredImages = images.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.module.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE)
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (imageName: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

    try {
      const res = await fetch(`/api/gallery/${encodeURIComponent(imageName)}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Error al eliminar imagen')
      
      toast.success('Imagen eliminada correctamente')
      fetchImages()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar la imagen')
    }
  }

  const handleRename = async (oldName: string) => {
    if (!newName.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }

    try {
      const res = await fetch(`/api/gallery/${encodeURIComponent(oldName)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName })
      })

      if (!res.ok) throw new Error('Error al renombrar imagen')
      
      toast.success('Imagen renombrada correctamente')
      setEditingImage(null)
      setNewName('')
      fetchImages()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al renombrar la imagen')
    }
  }

  const handleImageClick = (image: ImageFile) => {
    if (selectionMode && onImageSelect) {
      onImageSelect(image.url)
      return
    }

    // Si no estamos en modo selección, mostramos las opciones de edición
    setEditingImage(image)
    setNewName(image.name)
  }

  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 mt-8">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full ${
          currentPage === 1 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
        }`}
      >
        <FaChevronLeft />
      </motion.button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <motion.button
          key={page}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handlePageChange(page)}
          className={`w-8 h-8 rounded-full ${
            currentPage === page
              ? 'bg-pink-500 text-white'
              : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
          }`}
        >
          {page}
        </motion.button>
      ))}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full ${
          currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
        }`}
      >
        <FaChevronRight />
      </motion.button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 border-4 border-pink-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Galería de Imágenes</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar imágenes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {paginatedImages.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedImages.map((image) => (
              <motion.div
                key={image.url}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200">
                    {selectionMode ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center"
                        >
                          <FaCheck className="text-white" />
                        </motion.div>
                      </div>
                    ) : (
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingImage(image)
                              setNewName(image.name)
                            }}
                            className="p-2 bg-blue-500 text-white rounded-full"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(image.name)
                            }}
                            className="p-2 bg-red-500 text-white rounded-full"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                  <p className="text-xs text-gray-500">{image.module}</p>
                  {!selectionMode && (
                    <p className="text-xs text-gray-400">
                      {(image.size / 1024 / 1024).toFixed(2)} MB • {image.type.toUpperCase()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron imágenes</p>
        </div>
      )}

      <AnimatePresence>
        {editingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">Renombrar Imagen</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRename(editingImage.name)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 