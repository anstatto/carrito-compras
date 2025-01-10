import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Verificar si estamos en el cliente
      if (typeof window === 'undefined') {
        return initialValue
      }

      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error leyendo localStorage[${key}]:`, error)
      return initialValue
    }
  })

  // Efecto para sincronizar con localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
      }
    } catch (error) {
      console.warn(`Error escribiendo localStorage[${key}]:`, error)
    }
  }, [key, storedValue])

  // Función para actualizar el valor
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
    } catch (error) {
      console.warn(`Error actualizando localStorage[${key}]:`, error)
    }
  }

  return [storedValue, setValue] as const
} 