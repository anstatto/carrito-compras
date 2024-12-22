'use client'

import { useTheme } from 'next-themes'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 
                 hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-all duration-300 ease-in-out
                 transform hover:scale-110"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? (
        <FaSun className="w-5 h-5 text-yellow-400 animate-spin-slow" />
      ) : (
        <FaMoon className="w-5 h-5 text-gray-700 animate-pulse" />
      )}
    </button>
  )
} 