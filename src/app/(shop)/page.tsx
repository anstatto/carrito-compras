import Image from 'next/image'
import Link from 'next/link'
import { FaInstagram, FaWhatsapp, FaFacebook, FaStar } from 'react-icons/fa'
import ProductList from '@/app/components/products/ProductList'
import CategoryList from '@/app/components/categories/CategoryList'

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero Section con efecto glassmorphism */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-white opacity-50" />
        <div className="container mx-auto px-4">
          <div className="relative backdrop-blur-sm bg-white/30 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/logo/logo.png"
                alt="Arlin Glow Care"
                width={150}
                height={150}
                className="mb-8 hover:scale-105 transition-transform duration-300"
                priority
              />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 font-serif">
                Arlin Glow Care
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl font-light">
                Descubre nuestra exclusiva colección de productos para el cuidado de tu belleza
              </p>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  100% Natural
                </span>
                <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  Cruelty Free
                </span>
                <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  Dermatológicamente Probado
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/categorias"
                  className="px-8 py-3 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-300/50"
                >
                  Ver Catálogo
                </Link>
                <Link
                  href="/ofertas"
                  className="px-8 py-3 bg-white text-pink-500 rounded-full font-medium hover:bg-pink-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Ofertas Especiales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white/80">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif">
            Productos Destacados
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Descubre nuestra selección de productos más populares
          </p>
          <ProductList />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif">
            Explora Nuestras Categorías
          </h2>
          <CategoryList />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white/80">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif">
            Lo que dicen nuestras clientas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex text-pink-500 mb-4">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p className="text-gray-600 mb-4">
                "Los productos son increíbles, mi piel nunca se había sentido mejor"
              </p>
              <p className="font-medium text-gray-800">María G.</p>
            </div>
            {/* ... más testimonios ... */}
          </div>
        </div>
      </section>



      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/TUNUMERO"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 hover:scale-110 transform"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
    </div>
  )
} 