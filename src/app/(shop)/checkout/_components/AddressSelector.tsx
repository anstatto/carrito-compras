'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { FaPlus, FaSpinner } from 'react-icons/fa'
import DireccionForm from '../../perfil/direcciones/_components/DireccionForm'
import { ProvinciaRD, AgenciaEnvio } from '@prisma/client'
import { useSession } from 'next-auth/react'

interface Direccion {
  id: string
  calle: string
  numero: string
  sector: string
  municipio: string
  provincia: ProvinciaRD
  codigoPostal?: string
  telefono: string
  celular?: string
  agenciaEnvio?: AgenciaEnvio
  sucursalAgencia?: string
  predeterminada: boolean
}

interface AddressSelectorProps {
  onSelect: (addressId: string) => void
  selected: string
}

export default function AddressSelector({ onSelect, selected }: AddressSelectorProps) {
  const { status } = useSession()
  const [direcciones, setDirecciones] = useState<Direccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDirecciones = useCallback(async () => {
    if (status !== 'authenticated') {
      console.log('Usuario no autenticado') // Debug
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Iniciando fetch de direcciones') // Debug
      
      const res = await fetch('/api/direcciones', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      console.log('Status de respuesta:', res.status) // Debug

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al cargar direcciones')
      }

      const data = await res.json()
      console.log('Datos recibidos:', data) // Debug

      if (Array.isArray(data)) {
        setDirecciones(data)
        
        const predeterminada = data.find((d: Direccion) => d.predeterminada)
        if (predeterminada && !selected) {
          onSelect(predeterminada.id)
        }
      } else {
        throw new Error('Formato de datos inválido')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar las direcciones'
      setError(message)
      toast.error(message)
      console.error('Error detallado:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onSelect, selected, status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDirecciones()
    }
  }, [fetchDirecciones, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center p-4">
        <FaSpinner className="animate-spin h-6 w-6 text-pink-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
        <button 
          onClick={fetchDirecciones}
          className="ml-2 text-pink-500 hover:text-pink-600"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Dirección de envío
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-pink-600 hover:text-pink-700 flex items-center gap-2"
        >
          <FaPlus className="h-4 w-4" />
          Nueva dirección
        </button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <DireccionForm
            onSuccess={() => {
              setShowForm(false)
              fetchDirecciones()
            }}
          />
        </div>
      )}

      {direcciones.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No tienes direcciones guardadas. Agrega una nueva dirección.
        </div>
      ) : (
        <div className="space-y-3">
          {direcciones.map((direccion) => (
            <label
              key={direccion.id}
              className={`block relative border rounded-lg p-4 cursor-pointer transition-all
                ${selected === direccion.id 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-300 hover:border-pink-300'}`}
            >
              <input
                type="radio"
                name="direccion"
                value={direccion.id}
                checked={selected === direccion.id}
                onChange={() => onSelect(direccion.id)}
                className="sr-only"
              />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {direccion.calle} {direccion.numero}
                  </p>
                  <p className="text-gray-600">
                    {direccion.sector}, {direccion.municipio}
                  </p>
                  <p className="text-gray-600">
                    {direccion.provincia}
                    {direccion.codigoPostal && `, CP ${direccion.codigoPostal}`}
                  </p>
                  <p className="text-gray-600">Tel: {direccion.telefono}</p>
                </div>
                {direccion.predeterminada && (
                  <span className="text-sm text-pink-600">Predeterminada</span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
} 