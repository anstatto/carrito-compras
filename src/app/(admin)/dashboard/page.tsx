import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { FaBox, FaShoppingCart, FaUsers, FaDollarSign } from 'react-icons/fa'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const stats = {
    ventas: 15350,
    pedidos: 25,
    productos: 154,
    clientes: 2345
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Bienvenido, {session.user.nombre} {session.user.apellido}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-pink-600 text-xl" />
            <h2 className="font-bold text-gray-600">Ventas</h2>
          </div>
          <p className="text-2xl font-bold mt-2">${stats.ventas.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <FaShoppingCart className="text-pink-600 text-xl" />
            <h2 className="font-bold text-gray-600">Pedidos</h2>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.pedidos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <FaBox className="text-pink-600 text-xl" />
            <h2 className="font-bold text-gray-600">Productos</h2>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.productos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <FaUsers className="text-pink-600 text-xl" />
            <h2 className="font-bold text-gray-600">Clientes</h2>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.clientes.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
