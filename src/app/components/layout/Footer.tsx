import Link from 'next/link'
import Image from 'next/image'
import { FaInstagram, FaFacebook, FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Sección Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <Image
                src="/logo/logo.png"
                alt="Arlin Glow Care"
                width={120}
                height={120}
                className="mb-4"
              />
            </Link>
            <p className="text-gray-600 dark:text-gray-300">
              Tu destino de belleza y cuidado personal.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              {['Productos', 'Categorías', 'Ofertas', 'Sobre Nosotros'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <FaMapMarkerAlt className="text-pink-500" />
                <span>Av. Principal #123, Ciudad</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <FaPhone className="text-pink-500" />
                <span>+123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <FaEnvelope className="text-pink-500" />
                <span>contacto@arlinglow.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Newsletter
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Suscríbete para recibir ofertas exclusivas y consejos de belleza.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Tu email"
                className="w-full px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 
                         dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-pink-300 
                         dark:focus:ring-pink-500 focus:border-pink-300 outline-none"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-pink-500 text-white rounded-full 
                         hover:bg-pink-600 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="flex justify-center space-x-6 mt-12 mb-8">
          {[
            { icon: FaInstagram, href: 'https://instagram.com/arlinglow' },
            { icon: FaFacebook, href: 'https://facebook.com/arlinglow' },
            { icon: FaWhatsapp, href: 'https://wa.me/TUNUMERO' }
          ].map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl text-gray-600 hover:text-pink-500 transition-colors"
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center 
                          text-gray-600 dark:text-gray-300 text-sm">
            <p>© {new Date().getFullYear()} Arlin Glow Care. Todos los derechos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacidad" className="hover:text-pink-500 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-pink-500 transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
