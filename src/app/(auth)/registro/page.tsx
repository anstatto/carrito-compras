'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF69B4] to-[#FF1493]">
          Crear cuenta
        </h2>
        <p className="text-gray-600 mt-2">
          Completa tus datos para registrarte
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            name="name"
            type="text"
            required
            className="block w-full px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder="Nombre completo"
          />
          <input
            name="email"
            type="email"
            required
            className="block w-full px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder="Correo electrónico"
          />
          <input
            name="password"
            type="password"
            required
            className="block w-full px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder="Contraseña"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-[#FF69B4] to-[#FF1493] hover:from-[#FF82AB] hover:to-[#FF1493] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF69B4] transition-all duration-200"
        >
          Registrarse
        </button>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-gray-600 hover:text-[#FF69B4] transition-colors"
          >
            ¿Ya tienes cuenta? <span className="font-medium">Inicia sesión</span>
          </Link>
        </div>
      </form>
    </div>
  )
} 