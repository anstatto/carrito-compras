'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FaUser, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa'

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    {
      href: '/perfil',
      label: 'Mi Perfil',
      icon: FaUser,
      exact: true
    },
    {
      href: '/perfil/pedidos',
      label: 'Mis Pedidos',
      icon: FaShoppingBag
    },
    {
      href: '/perfil/direcciones',
      label: 'Mis Direcciones',
      icon: FaMapMarkerAlt
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2">
          {menuItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact 
              ? pathname === href
              : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            )
          })}
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 