"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-800 text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/dashboard"
                className={`flex items-center p-2 rounded-lg transition-colors ${isActive('/admin/dashboard')}`}
              >
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/products"
                className={`flex items-center p-2 rounded-lg transition-colors ${isActive('/admin/products')}`}
              >
                <span>Productos</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/products/create"
                className={`flex items-center p-2 rounded-lg transition-colors ${isActive('/admin/products/create')}`}
              >
                <span>Crear Producto</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/orders"
                className={`flex items-center p-2 rounded-lg transition-colors ${isActive('/admin/orders')}`}
              >
                <span>Pedidos</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}