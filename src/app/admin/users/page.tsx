'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FaSearch, FaUserEdit, FaBan, FaCheck, FaPlus, FaTimes } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: 'USER' | 'ADMIN'
  activo: boolean
  creadoEl: string
}

interface UserFormData {
  id?: string
  nombre: string
  apellido: string
  email: string
  password?: string
  role: 'USER' | 'ADMIN'
  activo: boolean
}

interface StatusChange {
  userId: string;
  newStatus: boolean;
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    role: 'USER',
    activo: true
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    newRole: 'USER' | 'ADMIN';
  } | null>(null)
  const [pendingStatusChange, setPendingStatusChange] = useState<StatusChange | null>(null)
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Error al guardar usuario')
      
      toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado')
      fetchUsers()
      handleCloseModal()
    } catch (error) {
      toast.error('Error al guardar el usuario')
      console.error(error)
    }
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setFormData({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role,
        activo: user.activo
      })
      setEditingUser(user)
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        role: 'USER',
        activo: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      role: 'USER',
      activo: true
    })
  }

  const initiateRoleChange = (userId: string, newRole: 'USER' | 'ADMIN') => {
    setPendingRoleChange({ userId, newRole })
    setShowConfirmModal(true)
  }

  const handleRoleChangeConfirm = async (password: string) => {
    if (!pendingRoleChange) return

    try {
      // Primero verificar la contraseña del admin
      const verifyRes = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      })

      if (!verifyRes.ok) {
        throw new Error('Contraseña incorrecta')
      }

      // Si la contraseña es correcta, proceder con el cambio de rol
      const res = await fetch(`/api/users/${pendingRoleChange.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: pendingRoleChange.newRole }),
      })

      if (!res.ok) throw new Error('Error al actualizar rol')
      
      toast.success('Rol actualizado correctamente')
      setUsers(users.map(user => 
        user.id === pendingRoleChange.userId 
          ? { ...user, role: pendingRoleChange.newRole } 
          : user
      ))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el rol')
      console.error(error)
    } finally {
      setShowConfirmModal(false)
      setPendingRoleChange(null)
    }
  }

  const initiateStatusChange = (userId: string, currentStatus: boolean) => {
    setPendingStatusChange({ userId, newStatus: !currentStatus })
    setShowStatusConfirmModal(true)
  }

  const handleStatusChangeConfirm = async (password: string) => {
    if (!pendingStatusChange) return

    try {
      // Verificar contraseña del admin
      const verifyRes = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      })

      if (!verifyRes.ok) {
        throw new Error('Contraseña incorrecta')
      }

      const res = await fetch(`/api/users/${pendingStatusChange.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: pendingStatusChange.newStatus }),
      })

      if (!res.ok) throw new Error('Error al actualizar estado')
      
      toast.success('Estado del usuario actualizado')
      setUsers(users.map(user => 
        user.id === pendingStatusChange.userId 
          ? { ...user, activo: pendingStatusChange.newStatus } 
          : user
      ))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el estado')
      console.error(error)
    } finally {
      setShowStatusConfirmModal(false)
      setPendingStatusChange(null)
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
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
                          onClick={() => initiateRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                          className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                          title={`Cambiar a ${user.role === 'ADMIN' ? 'Usuario' : 'Administrador'}`}
                        >
                          <FaUserEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => initiateStatusChange(user.id, user.activo)}
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

      <AnimatePresence>
        {showModal && (
          <UserModal
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
            isEditing={!!editingUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && pendingRoleChange && (
          <ConfirmRoleChangeModal
            onConfirm={handleRoleChangeConfirm}
            onClose={() => {
              setShowConfirmModal(false)
              setPendingRoleChange(null)
            }}
            newRole={pendingRoleChange.newRole}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatusConfirmModal && pendingStatusChange && (
          <ConfirmStatusChangeModal
            onConfirm={handleStatusChangeConfirm}
            onClose={() => {
              setShowStatusConfirmModal(false)
              setPendingStatusChange(null)
            }}
            newStatus={pendingStatusChange.newStatus}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function UserModal({
  formData,
  setFormData,
  onSubmit,
  onClose,
  isEditing
}: {
  formData: UserFormData
  setFormData: (data: UserFormData) => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  onClose: () => void
  isEditing: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                  required
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                    required={!isEditing}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label className="text-sm font-medium text-gray-700">Activo</label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ConfirmRoleChangeModal({
  onConfirm,
  onClose,
  newRole
}: {
  onConfirm: (password: string) => Promise<void>
  onClose: () => void
  newRole: 'USER' | 'ADMIN'
}) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onConfirm(password)
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-bold mb-4">Confirmar cambio de rol</h3>
        <p className="text-gray-600 mb-4">
          Estás a punto de cambiar el rol a <span className="font-semibold">{newRole}</span>.
          Por favor, ingresa tu contraseña para confirmar esta acción.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña de administrador</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function ConfirmStatusChangeModal({
  onConfirm,
  onClose,
  newStatus
}: {
  onConfirm: (password: string) => Promise<void>
  onClose: () => void
  newStatus: boolean
}) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onConfirm(password)
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-lg font-bold mb-4">Confirmar cambio de estado</h3>
        <p className="text-gray-600 mb-4">
          Estás a punto de {newStatus ? 'activar' : 'desactivar'} este usuario.
          Por favor, ingresa tu contraseña para confirmar esta acción.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña de administrador
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
} 