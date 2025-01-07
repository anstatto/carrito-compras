'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaSearch, FaUserEdit, FaBan, FaCheck } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: 'USER' | 'ADMIN'
  activo: boolean
  creadoEl: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      toast.error('Error al cargar los usuarios')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: !currentStatus }),
      })

      if (!res.ok) throw new Error('Error al actualizar usuario')
      
      toast.success('Estado del usuario actualizado')
      setUsers(users.map(user => 
        user.id === userId ? { ...user, activo: !currentStatus } : user
      ))
    } catch (error) {
      toast.error('Error al actualizar el estado del usuario')
      console.error(error)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    if (!window.confirm(`¿Estás seguro de cambiar el rol del usuario a ${newRole}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!res.ok) throw new Error('Error al actualizar rol')
      
      toast.success('Rol actualizado correctamente')
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      toast.error('Error al actualizar el rol')
      console.error(error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.creadoEl).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                          className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                          title={`Cambiar a ${user.role === 'ADMIN' ? 'Usuario' : 'Administrador'}`}
                        >
                          <FaUserEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.activo)}
                          className={`${
                            user.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          } transition-colors duration-200`}
                          title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {user.activo ? <FaBan className="w-5 h-5" /> : <FaCheck className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 