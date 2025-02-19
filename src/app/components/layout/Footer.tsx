'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import FooterLogo from './FooterLogo'

export default function Footer() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Error al enviar mensaje')

      toast.success('¡Mensaje enviado con éxito!')
      setFormData({ nombre: '', email: '', mensaje: '' })
    } catch (error) {
      toast.error('No se pudo enviar el mensaje')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <footer className="bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="space-y-4">
            <FooterLogo />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Tu destino de belleza y cuidado personal. Productos de alta
              calidad para realzar tu belleza natural.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              {["Categorias", "Ofertas", "Nosotros"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-lg"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Información de Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <FaMapMarkerAlt className="text-pink-500 text-xl" />
                <span className="text-lg">Av. Principal #123, Ciudad</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <FaPhone className="text-pink-500 text-xl" />
                <a
                  href="tel:+18297828831"
                  className="text-lg hover:text-pink-500 transition-colors"
                >
                  +1 (829) 782-8831
                </a>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <FaEnvelope className="text-pink-500 text-xl" />
                <a
                  href="mailto:contacto@arlinglow.com"
                  className="text-lg hover:text-pink-500 transition-colors"
                >
                  contacto@arlinglow.com
                </a>
              </li>
            </ul>
          </div>

          {/* Formulario de Contacto */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Contáctanos
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 
                         dark:border-gray-700 dark:bg-gray-800 dark:text-white 
                         focus:ring-2 focus:ring-pink-300 focus:border-transparent
                         transition-all duration-300"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Tu email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 
                         dark:border-gray-700 dark:bg-gray-800 dark:text-white 
                         focus:ring-2 focus:ring-pink-300 focus:border-transparent
                         transition-all duration-300"
              />
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Tu mensaje"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 
                         dark:border-gray-700 dark:bg-gray-800 dark:text-white 
                         focus:ring-2 focus:ring-pink-300 focus:border-transparent
                         transition-all duration-300 resize-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-pink-500 text-white rounded-lg
                         hover:bg-pink-600 transition-all duration-300 disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center justify-center
                         text-lg font-medium shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  "Enviar mensaje"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="flex justify-center space-x-8 mt-16 mb-8">
          {[
            {
              icon: FaInstagram,
              href: "https://instagram.com/arlinglow_",
              label: "Instagram",
            },
            {
              icon: FaWhatsapp,
              href: "https://wa.me/8297828831",
              label: "WhatsApp",
            },
          ].map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-3xl text-gray-600 hover:text-pink-500 transition-all duration-300 
                       hover:scale-110 transform"
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div
            className="flex flex-col md:flex-row justify-between items-center 
                        text-gray-600 dark:text-gray-300 text-sm"
          >
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} Arlin Glow Care. Todos los derechos
              reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacidad"
                className="hover:text-pink-500 transition-colors underline-offset-4 hover:underline"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terminos"
                className="hover:text-pink-500 transition-colors underline-offset-4 hover:underline"
              >
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
