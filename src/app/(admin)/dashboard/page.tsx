import Link from 'next/link'
import { FaBox, FaUsers, FaShoppingCart, FaTags } from 'react-icons/fa'

export default function DashboardPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="text-gray-600">Bienvenido al panel de control</p>
      </div>

      {/* Grid de Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Productos */}
        <Link href="/admin/products" 
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <FaBox className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Productos</h3>
              <p className="text-sm text-gray-500">Gestionar productos</p>
            </div>
          </div>
        </Link>

        {/* Categorías */}
        <Link href="/admin/categories" 
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <FaTags className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Categorías</h3>
              <p className="text-sm text-gray-500">Gestionar categorías</p>
            </div>
          </div>
        </Link>

        {/* Pedidos */}
        <Link href="/admin/orders" 
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FaShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Pedidos</h3>
              <p className="text-sm text-gray-500">Ver pedidos</p>
            </div>
          </div>
        </Link>

        {/* Usuarios */}
        <Link href="/admin/users" 
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <FaUsers className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Usuarios</h3>
              <p className="text-sm text-gray-500">Gestionar usuarios</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Estadísticas o Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Nuevos pedidos</span>
              <span className="text-pink-600 font-medium">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Productos en stock bajo</span>
              <span className="text-pink-600 font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mensajes nuevos</span>
              <span className="text-pink-600 font-medium">8</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Añadir nuevo producto
            </button>
            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Ver pedidos pendientes
            </button>
            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Actualizar inventario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
