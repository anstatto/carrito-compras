'use client'

import { useCart } from '@/app/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { FaTrash, FaTimes, FaShoppingBag } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'

export default function CartDropdown() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del carrito */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:text-pink-500 transition-colors"
      >
        <FaShoppingBag className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Dropdown del carrito */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Carrito de Compras</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16">
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.nombre}</h4>
                      <p className="text-pink-500">${item.precio.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={item.cantidad}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-pink-500 text-white text-center py-2 rounded-lg hover:bg-pink-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Proceder al pago
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 