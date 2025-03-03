'use client'

import { useState, useEffect, useRef } from 'react'
import { Client } from '@/app/types'
import { 
  FaSearch, 
  FaUser, 
  FaSpinner,
  FaPlus 
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import ClientModal from './ClientModal'

interface ClientSelectorProps {
  onSelect: (client: Client | null) => void
  selectedClient?: Client | null
}

export default function ClientSelector({ onSelect, selectedClient }: ClientSelectorProps) {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Cerrar el dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar clientes cuando el usuario escribe
  useEffect(() => {
    const searchClients = async () => {
      if (!search) {
        setClients([])
        return
      }
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
    <div className="relative" ref={searchRef}>
      <div className="relative">
        {selectedClient ? (
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
              <FaUser className="text-pink-500" />
            </div>
            <div className="flex-grow">
              <p className="font-medium">{selectedClient.nombre}</p>
              <p className="text-sm text-gray-500">{selectedClient.email}</p>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Buscar cliente por nombre o email..."
              className="w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 
                       focus:ring-pink-500 focus:border-pink-500"
            />
            <FaSearch className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !selectedClient && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg 
                     max-h-60 overflow-auto divide-y divide-gray-100"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <FaSpinner className="animate-spin mx-auto mb-2" />
                <p>Buscando...</p>
              </div>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <motion.div
                  key={client.id}
                  onClick={() => {
                    onSelect(client)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className="p-3 hover:bg-pink-50 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {client.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{client.nombre}</div>
                      <div className="text-sm text-gray-600">
                        {client.email} • {client.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500 mb-3">No se encontraron clientes</p>
                <button
                  onClick={() => setShowNewClientModal(true)}
                  className="text-pink-600 hover:text-pink-700 flex items-center gap-2 mx-auto"
                >
                  <FaPlus />
                  Crear nuevo cliente
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onSelect={(client) => {
          onSelect(client)
          setShowNewClientModal(false)
        }}
      />
    </div>
  )
}