"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaHome, FaBox, FaUsers, FaShoppingCart, FaTags } from 'react-icons/fa'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { 
      href: '/admin/dashboard', 
      label: 'Panel',
      icon: <FaHome className="w-5 h-5" />
    },
    { 
      href: '/admin/products', 
      label: 'Productos',
      icon: <FaBox className="w-5 h-5" />
    },
    { 
      href: '/admin/categories', 
      label: 'Categorías',
      icon: <FaTags className="w-5 h-5" />
    },
    { 
      href: '/admin/orders', 
      label: 'Pedidos',
      icon: <FaShoppingCart className="w-5 h-5" />
    },
    { 
      href: '/admin/users', 
      label: 'Usuarios',
      icon: <FaUsers className="w-5 h-5" />
    }
  ]

  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href 
                    ? 'bg-pink-50 text-pink-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
} 