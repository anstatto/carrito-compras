import Link from 'next/link'
import Image from 'next/image'
import { FaSearch, FaUser, FaHeart } from 'react-icons/fa'
import CartDropdown from '../cart/CartDropdown'
import ThemeToggle from '../ui/ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">


      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo/logo.png"
              alt="Arlin Glow Care"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Navegación Central */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/catalogo"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              Catálogo
            </Link>
            <Link 
              href="/categorias"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              Categorías
            </Link>
            <Link 
              href="/ofertas"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              Ofertas
            </Link>
            <Link 
              href="/nosotros"
              className="text-gray-700 hover:text-pink-500 transition-colors"
            >
              Nosotros
            </Link>
          </div>

          {/* Iconos de Acción */}
          <div className="flex items-center space-x-4">
            {/* Búsqueda */}
            <button className="p-2 hover:text-pink-500 transition-colors">
              <FaSearch className="w-5 h-5" />
            </button>

            {/* Favoritos */}
            <Link 
              href="/favoritos"
              className="p-2 hover:text-pink-500 transition-colors"
            >
              <FaHeart className="w-5 h-5" />
            </Link>

            {/* Usuario */}
            <Link 
              href="/cuenta"
              className="p-2 hover:text-pink-500 transition-colors"
            >
              <FaUser className="w-5 h-5" />
            </Link>
            <ThemeToggle />
            <CartDropdown />
          </div>
        </nav>
      </div>

      {/* Menú Móvil */}
      <div className="md:hidden border-t">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between">
            {['Catálogo', 'Categorías', 'Ofertas', 'Nosotros'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-gray-700 hover:text-pink-500 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}