'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function NosotrosPage() {
  return (
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-4xl mx-auto backdrop-blur-sm bg-white/40 
                       rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-[1.02] 
                       transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold 
                         text-gray-800 mb-6 font-serif"
              >
                Sobre Nosotros
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="prose prose-lg prose-pink max-w-3xl mx-auto text-gray-700"
              >
                <p className="text-lg sm:text-xl leading-relaxed mb-6">
                  En <span className="font-semibold text-pink-600">Arlin Glow Care</span>, 
                  creemos que el cuidado de la piel debe ser una experiencia tanto efectiva 
                  como placentera. Fundado en 2023 por <span className="font-semibold">Jhoarlin Consuegra</span>, 
                  nuestro emprendimiento se dedica a ofrecer productos naturales y de calidad 
                  para el cuidado de la piel.
                </p>

                <p className="text-lg sm:text-xl leading-relaxed mb-6">
                  Cada uno de nuestros productos está cuidadosamente formulado para brindar 
                  una limpieza profunda, hidratación y protección, respetando la salud y el 
                  equilibrio natural de la piel. En <span className="font-semibold text-pink-600">Arlin Glow Care</span>, 
                  buscamos que cada cliente encuentre el cuidado perfecto para su piel.
                </p>

                <p className="text-lg sm:text-xl leading-relaxed mb-6">
                  Nuestra misión es ofrecer productos innovadores y accesibles que transformen 
                  la rutina de cuidado personal en un momento de bienestar. Trabajamos con 
                  ingredientes naturales y formulaciones eficaces que respetan el medio ambiente.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-6 my-8"
              >
                {[
                  'Productos Naturales',
                  'Cuidado Premium',
                  'Belleza Consciente'
                ].map((text) => (
                  <motion.span
                    key={text}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-200/80 text-pink-900 
                             rounded-full text-sm font-medium transform transition-transform"
                  >
                    {text}
                  </motion.span>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4"
              >
                {[
                  { title: 'Exfoliantes', description: 'Limpieza profunda' },
                  { title: 'Cremas', description: 'Hidratación intensa' },
                  { title: 'Sérums', description: 'Tratamiento específico' }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.2 }}
                    className="bg-white/80 p-4 rounded-xl shadow-lg text-center w-full sm:w-auto 
                             min-w-[200px] backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
                  >
                    <h3 className="text-lg font-semibold text-pink-600 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}