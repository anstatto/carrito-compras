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
  codigoPostal?: string;
  referencia?: string;
  celular?: string;
  agenciaEnvio?: AgenciaEnvio;
  sucursalAgencia?: string;
}

interface OrderFormProps {
  onSuccess: () => void;
}

interface OrderData {
  clienteId: string;
  items: Array<{
    productoId: string;
    cantidad: number;
    precioUnit: number;
  }>;
  metodoPago: TipoPago;
  total: number;
}

const getNumericPrice = (precio: string | number): number => {
  const value = typeof precio === 'string' ? parseFloat(precio) : precio;
  if (isNaN(value)) throw new Error('Precio inválido');
  return value;
};

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentType, setPaymentType] = useState<TipoPago>(TipoPago.EFECTIVO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePaymentChange = (type: TipoPago) => {
    setPaymentType(type);
  };

  const checkClientAddress = useCallback(async () => {
    if (!client?.id) return;

    try {
      const res = await fetch(`/api/users/${client.id}/address`);
      if (!res.ok) throw new Error('Error al obtener la dirección');
      
      const data = await res.json();
      
      if (!data.hasDefaultAddress) {
        toast('Este cliente necesita una dirección de envío', {
          icon: 'ℹ️',
          style: {
            background: '#3B82F6',
            color: '#fff'
          }
        });
        setShowAddressModal(true);
        setAddress(null);
      } else {
        setAddress(data.address);
        setShowAddressModal(false);
      }
    } catch (error) {
      console.error('Error checking address:', error);
      toast.error(error instanceof Error ? error.message : 'Error al verificar la dirección');
      setAddress(null);
    }
  }, [client?.id]);

  useEffect(() => {
    if (client) {
      checkClientAddress();
    } else {
      setAddress(null);
      setShowAddressModal(false);
    }
  }, [client, checkClientAddress]);

  const handleAddressSubmit = async (addressData: Address) => {
    if (!client?.id) {
      toast.error('Selecciona un cliente primero');
      return;
    }

    try {
      const res = await fetch(`/api/users/${client.id}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressData, predeterminada: true })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al guardar la dirección');
      }

      const data = await res.json();
      setAddress(data);
      setShowAddressModal(false);
      toast.success('Dirección guardada correctamente');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la dirección');
    }
  };

  const calculateTotal = useCallback(() => {
    return products.reduce((sum, p) => {
      try {
        const numericPrice = getNumericPrice(p.precio);
        return sum + numericPrice * p.cantidad;
      } catch (error) {
        console.error(`Error calculating price for product ${p.id}:`, error);
        return sum;
      }
    }, 0);
  }, [products]);

  const total = calculateTotal();

  const validateOrder = (): boolean => {
    if (!client) {
      toast.error("Por favor selecciona un cliente");
      return false;
    }

    if (!address) {
      toast.error("El cliente necesita una dirección");
      setShowAddressModal(true);
      return false;
    }

    if (products.length === 0) {
      toast.error("Agrega al menos un producto");
      return false;
    }

    if (total <= 0) {
      toast.error("El total debe ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateOrder()) return;
    setIsSubmitting(true);

    try {
      const orderData: OrderData = {
        clienteId: client!.id,
        items: products.map(p => ({
          productoId: p.id,
          cantidad: p.cantidad,
          precioUnit: getNumericPrice(p.precio)
        })),
        metodoPago: paymentType,
        total: total
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la orden');
      }

      toast.success('Orden creada exitosamente');
      setClient(null);
      setProducts([]);
      setPaymentType(TipoPago.EFECTIVO);
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
                {address.agenciaEnvio && (
                  <>
                    <p className="mt-1 text-pink-600">
                      Agencia: {address.agenciaEnvio.replace(/_/g, ' ')}
                    </p>
                    {address.sucursalAgencia && (
                      <p className="text-pink-600">
                        Sucursal: {address.sucursalAgencia}
                      </p>
                    )}
                  </>
                )}
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
              <PaymentSelector 
                value={paymentType} 
                onChange={handlePaymentChange}
              />
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