"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
type Category = {
  id: string;
  nombre: string;
  descripcion?: string;
  slug: string;
  imagen?: string;
  _count: {
    productos: number;
  }
}

type CategoryCardProps = {
  category: Category;
  index: number;
  priority?: boolean;
};

export default function CategoryCard({ category, index, priority = false }: CategoryCardProps) {
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/catalogo/${category.slug}`}
        className="block group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-pink-200/50 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950/80 via-pink-900/50 to-transparent z-10" />
        
        {category.imagen ? (
          <Image
            src={category.imagen}
            alt={category.nombre}
            width={600}
            height={400}
            className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
            priority={priority}
            quality={85}
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
              `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'><filter id='b' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='1'/></filter><rect width='8' height='6' fill='#FDF2F8'/></svg>`
            ).toString('base64')}`}
          />
        ) : (
          <div className="w-full h-72 bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600">
                {category.nombre}
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform group-hover:translate-y-[-8px] transition-transform duration-300">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-100 transition-colors">
            {category.nombre}
          </h3>
          <p className="text-pink-50 mb-4 text-base leading-relaxed opacity-90">
            {category.descripcion || `Explora nuestra colección de ${category.nombre}`}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/90 bg-pink-900/40 px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
              {category._count.productos} productos
            </span>
            <motion.span
              className="text-white text-xl"
              whileHover={{ x: 10 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}