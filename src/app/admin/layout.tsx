'use client'

import { Sidebar } from './_components/Sidebar'
import { useSession } from 'next-auth/react'
import {  useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaStore, FaBars } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
    document.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <div className={`lg:pl-64 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'ml-[280px] sm:ml-64 blur-sm lg:ml-0 lg:blur-none' : 'ml-0'
      }`}>
        <header className="fixed right-0 top-0 left-0 lg:left-64 bg-white/90 backdrop-blur-md shadow-sm h-16 z-30">
          <div className="h-full px-4 flex items-center justify-between max-w-[2000px] mx-auto">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-gray-600 hover:text-pink-600 transition-colors"
                onClick={handleToggleSidebar}
              >
                <FaBars className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-800 lg:hidden">
                Admin Panel
              </h1>
            </div>
            
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-pink-600 transition-all duration-300 hover:scale-105"
            >
              <FaStore className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Ir a la tienda</span>
            </Link>
          </div>
        </header>

        <div className="relative pt-16">
          <div className="max-w-[2000px] mx-auto">
            <motion.main 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 md:p-6 lg:p-8 relative z-20"
            >
              {isSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
                  onClick={handleToggleSidebar}
                />
              )}
              
              <div className="mb-6 sticky top-[4.5rem] z-10 bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-md -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4">
                <div className="w-full overflow-x-auto">
                  {children}
                </div>
              </div>
            </motion.main>
          </div>
        </div>
      </div>
    </div>
  )
}
