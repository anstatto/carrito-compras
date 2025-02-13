"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { ProductView } from "@/interfaces/Product";
import ProductCardOfert from "@/app/components/products/ProductCardOferta";

type Product = ProductView;

export default function OfertasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?enOferta=true", {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      console.log(res);
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las ofertas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchProducts, 30000);

    // Actualizar cuando la página obtiene el foco
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header con animación */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Ofertas Especiales
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          ¡No te pierdas nuestras increíbles ofertas! Productos de alta calidad
          a precios especiales.
        </p>
      </motion.div>

      {isLoading ? (
        // Skeleton loader
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        // Mensaje cuando no hay ofertas
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-xl text-gray-600">
            No hay ofertas disponibles en este momento.
          </p>
          <p className="text-gray-500 mt-2">
            ¡Vuelve pronto para encontrar nuevas ofertas!
          </p>
        </motion.div>
      ) : (
        // Grid de productos en oferta
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="transform transition-all duration-300"
              >
                <ProductCardOfert
                  product={{
                    ...product,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Banner flotante de ofertas */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 
                   bg-gradient-to-r from-pink-500 to-violet-500 text-white 
                   px-6 py-3 rounded-full shadow-lg z-50"
      >
        <p className="text-sm font-medium">🔥 Ofertas por tiempo limitado</p>
      </motion.div>
    </main>
  );
}
