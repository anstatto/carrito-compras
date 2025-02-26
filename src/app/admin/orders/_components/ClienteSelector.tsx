'use client'

import { useState, useEffect } from 'react'
import { Client } from '@/app/types'
import { FaSearch } from 'react-icons/fa'

interface ClientSelectorProps {
  onSelect: (client: Client | null) => void
}

export default function ClientSelector({ onSelect }: ClientSelectorProps) {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Buscar clientes cuando el usuario escribe
  useEffect(() => {
    const searchClients = async () => {
      if (!search) return
      setLoading(true)
      try {
        const res = await fetch(`/api/users/search?q=${search}`)
        const data = await res.json()
        setClients(data)
      } catch (error) {
        console.error('Error buscando usuarios:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchClients, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar usuario por nombre o email..."
          className="w-full px-3 py-2 pl-10 border rounded-lg"
        />
        <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Buscando...</div>
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <div
                key={client.id}
                onClick={() => {
                  onSelect(client)
                  setSearch(`${client.nombre} ${client.apellido}`)
                  setIsOpen(false)
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                <div className="font-medium">
                  {client.nombre} {client.apellido}
                </div>
                <div className="text-sm text-gray-600">
                  {client.email} • {client.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No se encontraron usuarios
            </div>
          )}
        </div>
      )}
    </div>
  )
}