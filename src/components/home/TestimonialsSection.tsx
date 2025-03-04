'use client'

import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'

const testimonials = [
  {
    name: 'María G.',
    text: 'Los productos son increíbles, mi piel nunca se había sentido mejor. ¡Totalmente recomendado!',
    rating: 5
  },
  {
    name: 'Ana L.',
    text: 'Los productos son increíbles, mi piel nunca se había sentido mejor. ¡Totalmente recomendado!',
    rating: 5
  },
  // ... más testimonios
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-32 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 font-serif"
        >
          Lo que dicen nuestros clientes
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl 
                       transition-all duration-300"
            >
              <div className="flex text-pink-500 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="mr-1" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-200 rounded-full mr-4"></div>
                <div>
                  <p className="font-medium text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">Cliente Verificada</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 