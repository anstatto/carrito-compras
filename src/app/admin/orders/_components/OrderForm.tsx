'use client'

import { useState, useEffect, useCallback } from "react";
import ClientSelector from "./ClienteSelector";
import PaymentSelector from "./PaymentSelector";
import ProductTable from "./ProductTable";
import OrderSummary from "./OrderSummary";
import { TipoPago, ProvinciaRD, AgenciaEnvio } from "@prisma/client";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Product, Client } from '@/app/types'
import AddressModal from "./AddressModal";

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
  // campos opcionales
  codigoPostal?: string;
  referencia?: string;
  celular?: string;
  agenciaEnvio?: AgenciaEnvio;
  sucursalAgencia?: string;
}

interface OrderFormProps {
  onSuccess: () => void;
}

const getNumericPrice = (precio: string | number): number => {
  return typeof precio === 'string' ? parseFloat(precio) : precio;
};

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentType, setPaymentType] = useState<TipoPago>(TipoPago.TARJETA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkClientAddress = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${client?.id}/address`);
      const data = await res.json();
      
      if (!data.hasDefaultAddress) {
        setShowAddressModal(true);
      } else {
        setAddress(data.address);
      }
    } catch (error) {
      console.error('Error checking address:', error);
      toast.error('Error al verificar la dirección');
    }
  }, [client?.id]);

  useEffect(() => {
    if (client) {
      checkClientAddress();
    }
  }, [client, checkClientAddress]);

  const handleAddressSubmit = async (addressData: Address) => {
    try {
      const res = await fetch(`/api/users/${client?.id}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressData, predeterminada: true })
      });

      if (!res.ok) throw new Error('Error al guardar la dirección');

      const data = await res.json();
      setAddress(data);
      setShowAddressModal(false);
      toast.success('Dirección guardada correctamente');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error al guardar la dirección');
    }
  };

  const total = products.reduce((sum, p) => {
    const numericPrice = typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio;
    return sum + numericPrice * p.cantidad;
  }, 0);

  const handleSubmit = async () => {
    if (!client) {
      toast.error("Por favor selecciona un cliente");
      return;
    }

    if (!address) {
      toast.error("El cliente necesita una dirección");
      setShowAddressModal(true);
      return;
    }

    if (products.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        clienteId: client.id,
        items: products.map(p => ({
          productoId: p.id,
          cantidad: p.cantidad,
          precioUnit: getNumericPrice(p.precio)
        })),
        metodoPago: paymentType,
        total: total
      };

      console.log('Datos del pedido a enviar:', {
        cliente: client,
        direccion: address,
        productos: products,
        orderData
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la orden');
      }

      toast.success('Orden creada exitosamente');
      setClient(null);
      setProducts([]);
      setPaymentType(TipoPago.TARJETA);
      onSuccess();

    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-6">Nueva Orden</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <ClientSelector onSelect={setClient} />
            </div>
            
            {client && address && (
              <div className="text-sm">
                <label className="block font-medium">Dirección de envío</label>
                <p>{address.calle} #{address.numero}</p>
                <p>{address.sector}, {address.municipio}</p>
                <p>{address.provincia}</p>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-pink-600 text-xs mt-1"
                >
                  Cambiar dirección
                </button>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <PaymentSelector onChange={setPaymentType} />
            </div>
          </div>

          <ProductTable 
            products={products} 
            onUpdate={setProducts} 
          />

          <OrderSummary
            total={total}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </motion.div>

      {showAddressModal && (
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSubmit={handleAddressSubmit}
          initialData={address}
        />
      )}
    </>
  );
}