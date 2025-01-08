import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  const [
    totalProductos,
    totalCategorias,
    totalPedidos,
    productosAgotados
  ] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    prisma.categoria.count({ where: { activa: true } }),
    prisma.pedido.count(),
    prisma.producto.count({ where: { existencias: 0, activo: true } })
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Bienvenido, {session?.user?.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Productos</h3>
          <p className="text-3xl font-bold dark:text-white">{totalProductos}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Categorías</h3>
          <p className="text-3xl font-bold dark:text-white">{totalCategorias}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pedidos</h3>
          <p className="text-3xl font-bold dark:text-white">{totalPedidos}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Productos Agotados</h3>
          <p className="text-3xl font-bold text-red-600">{productosAgotados}</p>
        </div>
      </div>
    </div>
  )
} 