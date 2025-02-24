'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaUser, FaEnvelope, FaPhone, FaSpinner } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

interface UserProfile {
  nombre: string
  apellido: string
  email: string
  telefono?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [phone, setPhone] = useState<string | undefined>(profile?.telefono)
  const [isPhoneValid, setIsPhoneValid] = useState(true)
  const [nameError, setNameError] = useState<string | null>(null)
  const [lastNameError, setLastNameError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [session, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Error al cargar perfil')
      const data = await res.json()
      setProfile(data)
      setPhone(data.telefono)
    } catch (error) {
      toast.error('Error al cargar el perfil')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    if (!isValidPhoneNumber(phone ?? '')) {
      setIsPhoneValid(false)
      setIsSaving(false)
      return
    }

    // Validar los nombres
    const formData = new FormData(e.currentTarget)
    const nombre = formData.get('nombre')?.toString() ?? ''
    const apellido = formData.get('apellido')?.toString() ?? ''

    if (/\d/.test(nombre)) {
      setNameError('El nombre no puede contener números')
      setIsSaving(false)
      return
    } else {
      setNameError(null)
    }

    if (/\d/.test(apellido)) {
      setLastNameError('El apellido no puede contener números')
      setIsSaving(false)
      return
    } else {
      setLastNameError(null)
    }

    try {
      const data = {
        nombre,
        apellido,
        telefono: phone,
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al actualizar perfil')
      
      toast.success('Perfil actualizado correctamente')
      fetchProfile()
    } catch (error) {
      toast.error('Error al actualizar el perfil')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhoneChange = (value: string | undefined) => {
    setPhone(value)
    setIsPhoneValid(isValidPhoneNumber(value ?? ''))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={profile?.nombre}
                    required
                    className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                {nameError && (
                  <div className="text-red-600 text-sm mt-2">{nameError}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="apellido"
                    defaultValue={profile?.apellido}
                    required
                    className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                {lastNameError && (
                  <div className="text-red-600 text-sm mt-2">{lastNameError}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  defaultValue={profile?.email}
                  disabled
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <PhoneInput
                  international
                  defaultCountry="DO"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Número de teléfono"
                />
                {!isPhoneValid && (
                  <div className="text-red-600 text-sm mt-2">Número de teléfono inválido</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !isPhoneValid}
              className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5" />
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
