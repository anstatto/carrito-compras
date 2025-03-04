"use client";

import { motion } from "framer-motion";
import AddToCartButton from "../cart/AddToCartButton";
import ProductImageGallery from "./ProductImageGallery";
import FavoriteButton from "../FavoriteButton";
import { MarcaProducto } from "@prisma/client";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOferta: number | null;
  enOferta: boolean;
  marca: MarcaProducto;
  existencias: number;
  slug: string;
  categoria: {
    id: string;
    nombre: string;
    slug: string;
  };
  imagenes: {
    url: string;
    alt: string | null;
  }[];
}

type ProductContentProps = {
  producto: Producto;
};

export default function ProductContent({ producto }: ProductContentProps) {
  // Función para formatear la marca (reemplazar guiones bajos con espacios)
  const formatMarca = (marca: MarcaProducto) => {
    return marca.replace(/_/g, " ");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Galería de imágenes */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImageGallery
          images={producto.imagenes.map((img) => ({
            url: img.url,
            alt: img.alt || producto.nombre,
          }))}
          name={producto.nombre}
        />
      </motion.div>

      {/* Detalles del producto */}
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Nombre y marca */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <motion.h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {producto.nombre}
            </motion.h1>
            {producto.marca && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {formatMarca(producto.marca)}
              </p>
            )}
          </div>
          {/* Botón de favoritos */}
          <FavoriteButton
            productoId={producto.id}
            className="bg-gray-50 dark:bg-gray-800"
          />
        </div>

        {/* Botón de agregar al carrito */}
        {producto.existencias > 0 && (
          <AddToCartButton
            product={{
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precioOferta
                ? Number(producto.precioOferta)
                : Number(producto.precio),
              imagen: producto.imagenes[0]?.url || "/images/placeholder.png",
              marca: producto.marca,
              existencias: Number(producto.existencias),
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
