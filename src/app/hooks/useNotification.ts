import toast from 'react-hot-toast'

export const useNotification = () => {
  const showSuccess = (message: string) => {
    toast.success(message)
  }

  const showError = (message: string) => {
    toast.error(message)
  }

  return { showSuccess, showError }
} 