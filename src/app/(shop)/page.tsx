import Link from 'next/link'
import { FaWhatsapp, FaStar } from 'react-icons/fa'
import ProductList from '@/app/components/products/ProductList'
import CategoryList from '@/app/components/categories/CategoryList'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero Section con diseño mejorado y más responsive */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-transparent to-white">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('/gallery/fondo.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="relative w-full max-w-4xl mx-auto backdrop-blur-sm bg-white/40 rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-800 mb-6 font-serif animate-fade-in">
                  Arlin Glow Care
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl font-light leading-relaxed">
                  Descubre nuestra exclusiva colección de productos para el cuidado de tu belleza
                </p>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
                  <span className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-200/80 text-pink-900 rounded-full text-sm font-medium transform hover:scale-105 transition-transform">
                    100% Natural
                  </span>
                  <span className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-200/80 text-pink-900 rounded-full text-sm font-medium transform hover:scale-105 transition-transform">
                    Envíos a Todo el País
                  </span>
                  <span className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-200/80 text-pink-900 rounded-full text-sm font-medium transform hover:scale-105 transition-transform">
                    Productos Premium
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                  <Link
                    href="/catalogo"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-400/50 text-center"
                  >
                    Ver Catálogo
                  </Link>
                  <Link
                    href="/ofertas"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-white text-pink-600 rounded-full font-medium hover:bg-pink-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-center"
                  >
                    Ofertas Especiales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados con animaciones y mejor responsive */}
      <section className="bg-white/90 backdrop-blur-sm relative py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 font-serif text-pink-600 animate-fade-in">
            ¡Descubre Nuestros Productos Estrella!
          </h2>
          <p className="text-gray-600 text-center mb-12 text-lg sm:text-xl max-w-3xl mx-auto">
            ¡Explora nuestra selección de productos más populares y descubre por qué son los favoritos de nuestros clientes!
          </p>
          <ProductList />
        </div>
      </section>

      {/* Categorías con diseño mejorado */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 font-serif">
            Explora Nuestras Categorías
          </h2>
          <CategoryList />
        </div>
      </section>

      {/* Testimonios con mejor diseño y más interactivo */}
      <section className="py-20 sm:py-32 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 font-serif">
            Lo que dicen nuestras clientas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[1, 2, 3].map((index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex text-pink-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="mr-1" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  &quot;Los productos son increíbles, mi piel nunca se había sentido mejor. ¡Totalmente recomendado!&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium text-gray-800">María G.</p>
                    <p className="text-sm text-gray-500">Cliente Verificada</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Button mejorado */}
      <a
        href="https://wa.me/TUNUMERO"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-all duration-300 z-50 hover:scale-110 transform group"
      >
        <FaWhatsapp className="text-3xl group-hover:animate-pulse" />
      </a>
    </div>
  )
}