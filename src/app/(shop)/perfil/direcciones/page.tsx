'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa'
import DireccionForm from './_components/DireccionForm'
import { useRouter } from 'next/navigation'
import { ProvinciaRD } from '@prisma/client'

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
  predeterminada: boolean
}

export default function DireccionesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [direcciones, setDirecciones] = useState<Direccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/perfil/direcciones')
      return
    }

    if (status === 'authenticated') {
      fetchDirecciones()
    }
  }, [status, router])

  const fetchDirecciones = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/direcciones')
      if (!res.ok) throw new Error('Error al cargar direcciones')
      const data = await res.json()
      setDirecciones(data)
    } catch (error) {
      toast.error('Error al cargar las direcciones')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return

    try {
      const res = await fetch(`/api/direcciones/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Error al eliminar dirección')
      
      toast.success('Dirección eliminada correctamente')
      fetchDirecciones()
    } catch (error) {
      toast.error('Error al eliminar la dirección')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mis Direcciones</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingDireccion(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Nueva Dirección
        </motion.button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <DireccionForm
            direccionInicial={editingDireccion || undefined}
            onSuccess={() => {
              setShowForm(false)
              setEditingDireccion(null)
              fetchDirecciones()
            }}
          />
        </div>
      )}

      <div className="grid gap-6">
        {direcciones.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500">No tienes direcciones guardadas</p>
          </div>
        ) : (
          direcciones.map((direccion) => (
            <motion.div
              key={direccion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {direccion.calle} {direccion.numero}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {direccion.sector}, {direccion.municipio}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {direccion.provincia}
                    {direccion.codigoPostal && `, CP ${direccion.codigoPostal}`}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Tel: {direccion.telefono}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingDireccion(direccion)
                      setShowForm(true)
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(direccion.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {direccion.predeterminada && (
                <span className="mt-2 inline-block px-2 py-1 text-xs bg-pink-100 text-pink-600 rounded-full">
                  Predeterminada
                </span>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
} 