"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartBar, 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaCog, 
  FaTags,
  FaTruck,
  FaChartPie,
  FaTimes,
  FaImages
} from 'react-icons/fa'

interface MenuItem {
  href: string
  icon: React.ElementType
  label: string
  isImplemented?: boolean
}

const menuItems: MenuItem[] = [
  {
    href: '/admin/dashboard',
    icon: FaChartBar,
    label: 'Dashboard',
    isImplemented: true
  },
  {
    href: '/admin/users',
    icon: FaUsers,
    label: 'Usuarios',
    isImplemented: true
  },
  {
    href: '/admin/products',
    icon: FaBox,
    label: 'Productos',
    isImplemented: true
  },
  {
    href: '/admin/orders',
    icon: FaShoppingCart,
    label: 'Pedidos',
    isImplemented: true
  },
  {
    href: '/admin/categories',
    icon: FaTags,
    label: 'Categorías',
    isImplemented: true
  },
  {
    href: '/admin/gallery',
    icon: FaImages,
    label: 'Galería',
    isImplemented: true
  },
  {
    href: '/admin/analytics',
    icon: FaChartPie,
    label: 'Analíticas',
    isImplemented: false
  },
  {
    href: '/admin/shipping',
    icon: FaTruck,
    label: 'Envíos',
    isImplemented: false
  },
  {
    href: '/admin/settings',
    icon: FaCog,
    label: 'Configuración',
    isImplemented: false
  },

]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024)
  const [showModal, setShowModal] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024)

  const handleNotImplementedClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowModal(true)
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setIsOpen(!mobile)
    }

    const handleToggle = () => setIsOpen(prev => !prev)
    
    handleResize()
    window.addEventListener('resize', handleResize)
    document.addEventListener('toggle-sidebar', handleToggle)
    
    if (isMobile) {
      setIsOpen(false)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('toggle-sidebar', handleToggle)
    }
  }, [isMobile])

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const menuItemVariants = {
    hover: { 
      x: 8,
      transition: { type: "spring", stiffness: 400 }
    }
  }

  const iconVariants = {
    hover: { 
      scale: 1.2,
      rotate: 5,
      transition: { type: "spring", stiffness: 400 }
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isOpen ? { x: 0 } : { x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-white/95 backdrop-blur-lg shadow-2xl w-[280px] sm:w-64 min-h-screen fixed left-0 top-0 z-50 transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } overflow-y-auto flex flex-col`}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100">
          <motion.div 
            className="flex justify-between items-center p-4 lg:pt-16"
          >
            <motion.h1 
              className="text-xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent"
            >
              Admin Panel
            </motion.h1>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav>
            <motion.ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <motion.li 
                  key={item.href}
                  variants={menuItemVariants}
                  whileHover="hover"
                  onHoverStart={() => setHoveredItem(item.href)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  {item.isImplemented ? (
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-pink-50 to-violet-50 text-pink-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <motion.div
                        variants={iconVariants}
                        animate={hoveredItem === item.href ? "hover" : ""}
                      >
                        <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                          pathname === item.href ? 'scale-110' : ''
                        }`} />
                      </motion.div>
                      <span className="font-medium">{item.label}</span>
                      {pathname === item.href && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-8 bg-pink-500 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={handleNotImplementedClick}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-50 transition-all duration-300 relative group"
                    >
                      <motion.div
                        variants={iconVariants}
                        animate={hoveredItem === item.href ? "hover" : ""}
                      >
                        <item.icon className="w-5 h-5" />
                      </motion.div>
                      <span className="font-medium">{item.label}</span>
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        whileHover={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"
                      >
                        Próximamente
                      </motion.span>
                    </button>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </nav>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 p-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-pink-50 to-violet-50">
            <p className="text-sm text-gray-600 text-center">
              ¿Necesitas ayuda?
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full py-2 px-4 bg-white rounded-lg text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
            >
              Centro de Ayuda
            </motion.button>
          </div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <motion.div className="flex items-center gap-3 mb-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center"
                >
                  <FaCog className="w-5 h-5 text-pink-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900">
                  ¡Próximamente!
                </h3>
              </motion.div>
              <p className="text-gray-600 mb-6">
                Esta funcionalidad estará disponible próximamente. Estamos trabajando para brindarte una mejor experiencia.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 text-white py-2.5 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-violet-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Entendido
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 