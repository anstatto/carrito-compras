'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      })

      if (result?.error) {
        toast.error('Credenciales inválidas')
        return
      }

      const response = await fetch('/api/auth/session')
      const session = await response.json()

      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Ocurrió un error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF69B4] to-[#FF1493]">
          Bienvenido de nuevo
        </h2>
        <p className="text-gray-600 mt-2">
          Ingresa tus credenciales para continuar
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-[#FF82AB]" />
            </div>
            <input
              name="email"
              type="email"
              required
              className="block w-full pl-10 px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
              placeholder="Correo electrónico"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-[#FF82AB]" />
            </div>
            <input
              name="password"
              type="password"
              required
              className="block w-full pl-10 px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
              placeholder="Contraseña"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-[#FF69B4] to-[#FF1493] hover:from-[#FF82AB] hover:to-[#FF1493] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF69B4] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin h-5 w-5" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>

        <div className="text-center">
          <Link 
            href="/registro" 
            className="text-sm text-gray-600 hover:text-[#FF69B4] transition-colors"
          >
            ¿No tienes cuenta? <span className="font-medium">Regístrate</span>
          </Link>
        </div>
      </form>
    </div>
  )
}
