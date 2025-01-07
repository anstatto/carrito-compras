import Link from 'next/link'
import { FaWhatsapp, FaStar } from 'react-icons/fa'
import ProductList from '@/app/components/products/ProductList'
import CategoryList from '@/app/components/categories/CategoryList'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Sección Hero con efecto glassmorphism modernizado y diseño temático */}
      <section className="relative py-20 bg-gradient-to-b from-transparent to-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/gallery/fondo.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="container mx-auto px-4">
            <div className="relative backdrop-blur-sm bg-white/30 rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-6 font-serif">
                  Arlin Glow Care
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl font-light">
                  Descubre nuestra exclusiva colección de productos para el cuidado de tu belleza
                </p>

                {/* Badges modernizados con diseño temático */}
                <div className="flex flex-wrap justify-center gap-6 mb-10">
                  <span className="px-6 py-3 bg-pink-200 text-pink-900 rounded-full text-sm font-medium">
                    100% Natural
                  </span>
                  <span className="px-6 py-3 bg-pink-200 text-pink-900 rounded-full text-sm font-medium">
                    Cruelty Free
                  </span>
                  <span className="px-6 py-3 bg-pink-200 text-pink-900 rounded-full text-sm font-medium">
                    Dermatológicamente Probado
                  </span>
                </div>

                {/* Botones CTA modernizados con diseño temático */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    href="/catalogo"
                    className="px-12 py-4 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-pink-400/50"
                  >
                    Ver Catálogo
                  </Link>
                  <Link
                    href="/ofertas"
                    className="px-12 py-4 bg-white text-pink-600 rounded-full font-medium hover:bg-pink-200 transform hover:scale-110 transition-all duration-300 shadow-lg"
                  >
                    Ofertas Especiales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <section className="bg-white/80 relative mt-80">
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif text-pink-600">
            ¡Descubre Nuestros Productos Estrella!
          </h2>
          <p className="text-gray-600 text-center mb-10">
            ¡Explora nuestra selección de productos más populares y descubre por qué son los favoritos de nuestros clientes!
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
                &quot;Los productos son increíbles, mi piel nunca se había sentido mejor&quot;
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