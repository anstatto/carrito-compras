import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'

// Obtener categorías activas con conteo de productos
async function getCategories() {
  const categories = await prisma.categoria.findMany({
    where: {
      activa: true,
    },
    include: {
      _count: {
        select: { productos: true }
      }
    }
  })
  return categories
}

export default async function CategoryList() {
  const categories = await getCategories()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {categories.map((category) => (
        <Link 
          key={category.id}
          href={`/catalogo/${category.slug}`}
          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500"
        >
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 to-transparent z-10" />
          
          {/* Imagen o placeholder */}
          {category.imagen ? (
            <Image
              src={category.imagen}
              alt={category.nombre}
              width={400}
              height={300}
              className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-700"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-80 bg-gradient-to-br from-pink-100 to-pink-200">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-pink-500">
                  {category.nombre}
                </span>
              </div>
            </div>
          )}

          {/* Contenido */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h3 className="text-2xl font-bold text-white mb-2">
              {category.nombre}
            </h3>
            <p className="text-pink-100 mb-4">
              {category.descripcion || `Explora nuestra colección de ${category.nombre}`}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white/90">
                {category._count.productos} productos
              </span>
              <span className="text-white group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 