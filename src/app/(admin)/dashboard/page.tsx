import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Administración',
  description: 'Panel de control administrativo'
}

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Productos */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          {/* Aquí puedes agregar estadísticas de productos */}
        </div>

        {/* Tarjeta de Pedidos */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pedidos</h2>
          {/* Aquí puedes agregar estadísticas de pedidos */}
        </div>

        {/* Tarjeta de Usuarios */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
          {/* Aquí puedes agregar estadísticas de usuarios */}
        </div>
      </div>
    </div>
  )
}
