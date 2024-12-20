import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProductsPage() {
  const productos = await prisma.producto.findMany({
    orderBy: {
      creadoEl: 'desc'
    }
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link 
          href="/admin/products/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear Producto
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Existencias</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="px-6 py-4">{producto.nombre}</td>
                <td className="px-6 py-4">${producto.precio}</td>
                <td className="px-6 py-4">{producto.existencias}</td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/admin/products/edit/${producto.id}`}
                    className="text-blue-500 hover:text-blue-700 mr-4"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 