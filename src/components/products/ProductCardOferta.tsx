"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "../cart/AddToCartButton";
import FavoriteButton from "../FavoriteButton";
import { motion } from "framer-motion";
import { MarcaProducto } from "@prisma/client";

interface ProductCardProps {
  product: {
    id: string;
    nombre: string;
    precio: number;
    precioOferta?: number | null;
    enOferta?: boolean;
    marca: MarcaProducto;
    destacado?: boolean;
    imagenes: { url: string; alt?: string | null }[];
    categoria: {
      nombre: string;
      slug: string;
    };
    existencias: number;
    descripcion: string;
  };
}

export default function ProductCardOfert({ product }: ProductCardProps) {
  const precioFinal =
    product.enOferta && product.precioOferta
      ? Number(product.precioOferta)
      : Number(product.precio);

  const descuento =
    product.enOferta && product.precioOferta
      ? Math.round((1 - product.precioOferta / product.precio) * 100)
      : 0;

  return (
    <div
      className="group relative flex flex-col h-full bg-white dark:bg-gray-800 
                    rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 
                    border border-[#FFB6C1]/20 dark:border-gray-700 overflow-hidden"
    >
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start">
        <FavoriteButton
          productoId={product.id}
          className="bg-white/80 backdrop-blur-sm shadow-lg
                    dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
        />

        <div className="flex flex-col gap-2">
          {product.enOferta === true && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="bg-gradient-to-r from-[#FF69B4] to-[#FF1493] 
                        text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg
                        border-2 border-white dark:border-gray-800"
            >
              {descuento}% OFF
            </motion.div>
          )}
          {product.destacado === true && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 150,
                damping: 15,
              }}
              className="bg-gradient-to-r from-amber-400 to-orange-500
                        text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg
                        border-2 border-white dark:border-gray-800"
            >
              ⭐ Destacado
            </motion.div>
          )}
        </div>
      </div>

      <Link
        href={`/productos/${product.nombre.toLowerCase().replace(/\s+/g, "-")}`}
        className="flex-1"
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imagenes[0]?.url || "/placeholder-product.jpg"}
            alt={product.nombre}
            fill
            priority={true}
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 
                         group-hover:text-[#FF69B4] transition-colors duration-300"
            >
              {product.nombre}
            </h3>
            <span
              className="px-2.5 py-0.5 text-xs font-medium bg-[#FFF0F5] dark:bg-[#FF69B4]/20 
                           text-[#FF69B4] dark:text-[#FFB6C1] rounded-full whitespace-nowrap"
            >
              {product.categoria.nombre}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.descripcion}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-bold ${product.enOferta ? "text-[#FF69B4]" : "text-gray-900 dark:text-white"}`}
              >
                ${precioFinal.toFixed(2)}
              </span>
              {product.enOferta && product.precioOferta && (
                <span className="text-sm text-gray-500 line-through">
                  ${Number(product.precio).toFixed(2)}
                </span>
              )}
            </div>
            {product.existencias <= 5 && product.existencias > 0 && (
              <span className="text-xs text-[#FF1493] font-medium">
                ¡Últimas {product.existencias} unidades!
              </span>
            )}
          </div>

          {product.marca && (
            <p className="text-sm text-gray-500">
              {product.marca.replace("_", " ")}
            </p>
          )}
        </div>
      </Link>

      <div className="p-5 pt-0 mt-auto">
        <AddToCartButton
          product={{
            id: product.id,
            nombre: product.nombre,
            precio: precioFinal,
            imagen: product.imagenes?.[0]?.url || "/images/placeholder.png",
            existencias: product.existencias,
            marca: product.marca || "",
          }}
        />
      </div>
    </div>
  );
}
