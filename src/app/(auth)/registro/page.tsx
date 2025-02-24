'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | undefined>('') // Usamos string en lugar de E164Number
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true)
  const [name, setName] = useState<string>('') // Estado para el nombre
  const [isNameValid, setIsNameValid] = useState<boolean>(true) // Validación del nombre

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Validación del teléfono
    if (!isValidPhoneNumber(phone ?? '')) {
      setIsPhoneValid(false)
      return
    }

    // Validación del nombre
    if (!isNameValid) {
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
          name: formData.get('name'),
          telefono: phone, // Enviar el teléfono como string
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

  // Función para manejar el cambio del nombre
  const handleNameChange = (value: string) => {
    setName(value)

    // Validación del nombre: no permite números
    const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/; // Solo permite letras y espacios
    if (regex.test(value)) {
      setIsNameValid(true)
    } else {
      setIsNameValid(false)
    }
  }

  // Función para manejar el cambio del número de teléfono
  const handlePhoneChange = (value: string | undefined) => {
    setPhone(value)

    // Validación del teléfono
    if (isValidPhoneNumber(value ?? '')) {
      setIsPhoneValid(true)
    } else {
      setIsPhoneValid(false)
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
          {/* Campo de nombre con validación */}
          <input
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)} // Cambiar nombre
            className="block w-full px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder="Nombre completo"
          />
          {!isNameValid && (
            <div className="text-red-600 text-sm mt-2">El nombre no puede contener números</div>
          )}

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

          {/* Campo de teléfono con formateo y selección de país */}
          <PhoneInput
            international
            defaultCountry="DO" // República Dominicana por defecto
            value={phone}
            onChange={handlePhoneChange}
            countries={['DO', 'US']} // Restringir solo a República Dominicana y Estados Unidos
            className="block w-full px-3 py-2 border border-[#FFB6C1] rounded-lg focus:ring-2 focus:ring-[#FF69B4] focus:border-transparent bg-white/50 backdrop-blur-sm"
            placeholder="Número de teléfono"
          />
          {!isPhoneValid && (
            <div className="text-red-600 text-sm mt-2">Número de teléfono inválido</div>
          )}
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
