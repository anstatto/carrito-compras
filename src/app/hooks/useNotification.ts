import toast from 'react-hot-toast'

type NotificationOptions = {
  duration?: number
  icon?: string | React.ReactNode
}

export const useNotification = () => {
  const showSuccess = (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: options?.duration || 3000,
      icon: options?.icon || '✨',
      style: {
        background: '#10B981',
        color: '#fff',
        borderRadius: '10px',
      },
      position: 'bottom-left', // Cambiar la posición aquí
    })
  }

  const showError = (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: options?.duration || 4000,
      icon: options?.icon || '❌',
      style: {
        background: '#EF4444',
        color: '#fff',
        borderRadius: '10px',
      },
      position: 'bottom-left', // Cambiar la posición aquí
    })
  }

  const showInfo = (message: string, options?: NotificationOptions) => {
    toast(message, {
      duration: options?.duration || 3000,
      icon: options?.icon || 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        borderRadius: '10px',
      },
      position: 'bottom-left', // Cambiar la posición aquí
    })
  }

  return { showSuccess, showError, showInfo }
}
