'use client'

import { useState } from 'react'
import { ProvinciaRD } from '@prisma/client'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { FaTimes, FaMapMarkerAlt, FaPhone, FaBuilding } from 'react-icons/fa'

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Address) => void;
  initialData?: Address | null;
}

interface Address {
  id?: string;
  calle: string;
  numero: string;
  sector: string;
  provincia: ProvinciaRD;
  municipio: string;
  telefono: string;
  predeterminada: boolean;
  userId: string;
}

export default function AddressModal({ isOpen, onClose, onSubmit, initialData }: AddressModalProps) {
  const [formData, setFormData] = useState<Address>(initialData || {
    calle: '',
    numero: '',
    sector: '',
    provincia: 'DISTRITO_NACIONAL',
    municipio: '',
    telefono: '',
    predeterminada: true,
    userId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar' : 'Agregar'} Dirección
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              <FaMapMarkerAlt className="inline mr-2" />
              Calle
            </label>
            <input
              type="text"
              name="calle"
              value={formData.calle}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              <FaBuilding className="inline mr-2" />
              Número
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sector</label>
            <input
              type="text"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Provincia</label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              {Object.values(ProvinciaRD).map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Municipio</label>
            <input
              type="text"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              <FaPhone className="inline mr-2" />
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </form>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
          >
            <FaTimes className="mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 flex items-center"
          >
            <FaMapMarkerAlt className="mr-2" />
            Guardar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 