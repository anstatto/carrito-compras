"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaUpload,
  FaSpinner,
} from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ImageInfo {
  name: string;
  url: string;
  module: string;
  size: number;
  createdAt: Date;
  type: string;
  public_id?: string;
}

const ITEMS_PER_PAGE = 20;

interface GalleryProps {
  selectionMode?: 'url-only' | 'full' | false;
  onImageSelect?: (image: ImageInfo | string) => void;
  allowedModules?: string[];
}

export default function Gallery({ selectionMode = false, onImageSelect, allowedModules }: GalleryProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchImages();
  }, [session, status, router]);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Error al cargar imágenes");
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar imágenes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    formData.append("module", moduleFilter === "all" ? "productos" : moduleFilter);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al subir imágenes");
      }
      
      const uploadedFiles = await res.json();
      setImages(prev => [...uploadedFiles, ...prev]);
      toast.success("Imágenes subidas correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al subir las imágenes");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: ImageInfo) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    try {
      const res = await fetch(`/api/gallery/${encodeURIComponent(image.public_id || '')}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar imagen");
      }
      
      toast.success("Imagen eliminada correctamente");
      setImages(images.filter(img => img.public_id !== image.public_id));
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la imagen");
      console.error(error);
    }
  };

  const filteredImages = images.filter((image) => {
    const matchesFilter = image.name.toLowerCase().includes(filter.toLowerCase());
    const matchesModule = moduleFilter === "all" || image.module === moduleFilter;
    return matchesFilter && matchesModule;
  });

  const modules = ["all", ...new Set(images.map(img => img.module))];
  
  // Paginación
  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar imágenes..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
          >
            {modules.map((module) => (
              <option key={module} value={module}>
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="image-upload"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 cursor-pointer ${
              uploading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            {uploading ? "Subiendo..." : "Subir imágenes"}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-pink-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {paginatedImages.map((image) => (
                <motion.div
                  key={image.name}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200 hover:border-pink-500 transition-colors">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className={`object-cover cursor-pointer ${selectionMode ? 'hover:opacity-75' : ''}`}
                      onClick={() => {
                        if (selectionMode && onImageSelect) {
                          if (selectionMode === 'url-only') {
                            onImageSelect(image.url);
                          } else {
                            onImageSelect(image);
                          }
                          toast.success('Imagen seleccionada');
                          return;
                        }
                        setSelectedImage(image);
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      {selectionMode ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onImageSelect) {
                              onImageSelect(image);
                              toast.success('Imagen seleccionada');
                            }
                          }}
                          className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700"
                        >
                          <FaCheck />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(image);
                          }}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="truncate">{image.name}</p>
                    <p className="text-xs text-gray-400">
                      {(image.size / 1024).toFixed(1)}KB · {image.module}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de vista previa */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage.url}
              alt={selectedImage.name}
              width={800}
              height={800}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
