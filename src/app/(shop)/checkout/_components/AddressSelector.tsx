'use client'
import React, { useEffect, useState } from 'react'

interface Address {
  id: string
  calle: string
  numeroExt: string
  numeroInt?: string
  colonia: string
  ciudad: string
  estado: string
  codigoPostal: string
  telefono: string
}

interface AddressSelectorProps {
  userId: string
  onSelect: (addressId: string) => void
  selected: string
}

export default function AddressSelector({ userId, onSelect, selected }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/addresses?userId=${userId}`);
        if (!response.ok) throw new Error('Error al obtener direcciones');

        const data = await response.json();
        setAddresses(data);
        if (data.length === 1) onSelect(data[0].id);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [userId, onSelect]);

  if (isLoading) return <div>Cargando direcciones...</div>;

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
        <a 
          href="/perfil/direcciones/nueva" 
          className="text-pink-500 hover:text-pink-600 font-medium"
        >
          Agregar nueva dirección
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dirección de envío</h2>
      
      {addresses.map((address) => (
        <label
          key={address.id}
          className={`block p-4 rounded-xl border-2 cursor-pointer transition-all
          ${selected === address.id 
            ? 'border-pink-500 bg-pink-50/50' 
            : 'border-gray-200 hover:border-pink-200'}`}
        >
          <input
            type="radio"
            name="address"
            value={address.id}
            checked={selected === address.id}
            onChange={() => onSelect(address.id)}
            className="hidden"
          />
          <div className="space-y-1">
            <p className="font-medium">
              {address.calle} {address.numeroExt}
              {address.numeroInt && `, Int. ${address.numeroInt}`}
            </p>
            <p className="text-sm text-gray-500">
              {address.colonia}, {address.ciudad}, {address.estado}
            </p>
            <p className="text-sm text-gray-500">
              CP: {address.codigoPostal}
            </p>
            <p className="text-sm text-gray-500">
              Tel: {address.telefono}
            </p>
          </div>
        </label>
      ))}
    </div>
  )
} 