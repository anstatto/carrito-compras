"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { FaPlus, FaTimes, FaImages } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Cargar GalleryPage de forma dinámica
const GalleryPage = dynamic(() => import("../../_components/galeria/Gallery"), {
  loading: () => <div>Cargando galería...</div>,
  ssr: false,
});

interface ImageSelectorProps {
  currentImage: string | null;
  onImageSelect: (url: string) => void;
}

export const ImageSelector = memo(function ImageSelector({
  currentImage,
  onImageSelect,
}: ImageSelectorProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tamaño y tipo de archivo
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("El archivo debe ser una imagen");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("module", "categorias");
        formData.append("name", `${file.name}_${Date.now()}`);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Error al subir imagen");

        const data = await res.json();
        onImageSelect(data.url);
        toast.success("Imagen subida correctamente");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error al subir la imagen");
      } finally {
        setIsUploading(false);
      }
    },
    [onImageSelect]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Imagen
        </label>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGallery(true)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 rounded-lg hover:from-pink-100 hover:to-violet-100 transition-all flex items-center gap-2"
          >
            <FaImages className="w-4 h-4" />
            <span>Galería</span>
          </motion.button>
          <label className="px-4 py-2 text-sm bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 rounded-lg hover:from-pink-100 hover:to-violet-100 transition-all flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
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
        </div>
      </div>

      {currentImage && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-video w-full group"
        >
          <Image
            src={currentImage}
            alt="Preview"
            fill
            className="object-cover rounded-lg"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onImageSelect("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
          >
            <FaTimes size={12} />
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowGallery(false);
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
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <GalleryPage
                  onImageSelect={(url) => {
                    onImageSelect(url);
                    setShowGallery(false);
                  }}
                  selectionMode={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
