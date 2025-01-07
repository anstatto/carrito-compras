import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getCategorias() {
  const categorias = await prisma.categoria.findMany({
    include: {
      productos: true
    }
  })
  return categorias
}

export default async function CategoriasPage() {
  const categorias = await getCategorias()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map((categoria) => (
          <Link
            key={categoria.id}
            href={`/categorias/${categoria.id}`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{categoria.nombre}</h2>
            <p className="text-gray-600">{categoria.productos.length} productos</p>
          </Link>
        ))}
      </div>
    </main>
  )
} 