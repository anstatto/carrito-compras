import { Suspense } from 'react'
import ProductList from '@/app/components/products/ProductList'
import Link from 'next/link'
import CartButton from '@/app/components/cart/CartButton'

export default function HomePage() {
  return (
    <Suspense fallback={<div>Cargando productos...</div>}>
      <main className="min-h-screen bg-gradient-to-b from-white to-pink-50">
        {/* Header Fijo */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-pink-100 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-transparent bg-clip-text">
                Arlin Glow Care
              </h1>
              <CartButton />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section Mejorado */}
          <section className="relative overflow-hidden rounded-2xl mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 backdrop-blur-sm"></div>
            <div className="relative z-10 py-16 px-8">
              <h2 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
                Belleza y Cuidado
                <span className="block text-pink-600">Personal Premium</span>
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl">
                Descubre nuestra exclusiva colección de productos premium para realzar tu belleza natural y mantener un cuidado personal excepcional.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/categorias" 
                  className="btn-primary transform hover:scale-105 transition-transform duration-300"
                >
                  Explorar Categorías
                </Link>
                <Link 
                  href="/ofertas" 
                  className="btn-secondary transform hover:scale-105 transition-transform duration-300"
                >
                  Ofertas Exclusivas
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Products con Título Elegante */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Productos Destacados
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent"></div>
            </div>
            <ProductList />
          </section>

          {/* Contact Section Modernizado */}
          <section className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 shadow-lg">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Necesitas Asesoramiento Personalizado?
              </h2>
              <p className="text-gray-600 mb-8">
                Nuestro equipo de expertos está listo para ayudarte a encontrar los productos perfectos para tu rutina de belleza.
              </p>
              <a
                href="https://wa.me/TUNUMERO"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar por WhatsApp
              </a>
            </div>
          </section>
        </div>
      </main>
    </Suspense>
  )
}