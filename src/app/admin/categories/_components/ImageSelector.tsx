"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, memo } from "react";
import Image from "next/image";
import { FaPlus, FaTimes, FaImages, FaCloudUploadAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Gallery = dynamic(() => import("../../_components/galeria/Gallery"), {
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"
      />
    </div>
  ),
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
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
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
        formData.append("files", file);
        formData.append("module", "categorias");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Error al subir imagen");

        const data = await res.json();
        onImageSelect(data[0].url);
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

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-800">
          Imagen
        </label>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGallery(true)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-pink-50 to-violet-50 
                     text-pink-600 rounded-xl hover:from-pink-100 hover:to-violet-100 
                     transition-all flex items-center gap-2 shadow-sm hover:shadow"
          >
            <FaImages className="w-4 h-4" />
            <span>Galería</span>
          </motion.button>
          <label className="px-4 py-2 text-sm bg-gradient-to-r from-pink-50 to-violet-50 
                          text-pink-600 rounded-xl hover:from-pink-100 hover:to-violet-100 
                          transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
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

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative aspect-video w-full rounded-xl border-2 border-dashed transition-all
                   ${isDragging
            ? "border-pink-500 bg-pink-50"
            : currentImage
              ? "border-transparent"
              : "border-gray-300 hover:border-pink-500 hover:bg-pink-50/30"
          }`}
      >
        {currentImage ? (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full group"
          >
            <Image
              src={currentImage}
              alt="Preview"
              fill
              className="object-cover rounded-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onImageSelect("")}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 
                       opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
              <FaTimes size={12} />
            </motion.button>
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <FaCloudUploadAlt size={40} />
            <p className="mt-2 text-sm">
              Arrastra una imagen o haz clic para seleccionar
            </p>
          </div>
        )}
      </div>

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
                <Gallery
                  selectionMode="url-only"
                  onImageSelect={(image) => {
                    const url = typeof image === 'string' ? image : image.url;
                    onImageSelect(url);
                    setShowGallery(false);
                  }}
                  allowedModules={["categorias"]}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
