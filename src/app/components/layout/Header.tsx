import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-pink-600">
          Arlin Glow Care
        </Link>
        <div className="flex gap-4">
          <Link href="/products" className="text-gray-600 hover:text-pink-600">
            Productos
          </Link>
          {/* Más enlaces de navegación */}
        </div>
      </nav>
    </header>
  )
}
