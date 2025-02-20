"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import OrderSummary from "./_components/OrderSummary";
import AddressSelector from "./_components/AddressSelector";
import { FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

const sendToWhatsApp = async (
  items: CartItem[],
  selectedAddress: string,
  clearCart: () => void
) => {
  if (!selectedAddress) {
    toast.error("Por favor, selecciona una dirección antes de continuar.");
    return;
  }

  if (items.length === 0) {
    toast.error("Tu carrito está vacío.");
    return;
  }

  const loadingToast = toast.loading("Generando solicitud de pedido...");

  try {
    const total = items.reduce(
      (acc, item) => acc + (item.precio * item.cantidad),
      0
    );

    const orderData = {
      items: items.map(({ id, cantidad, precio }) => ({
        id,
        cantidad,
        precio: Number(precio),
      })),
      direccionId: selectedAddress,
      total: Number(total),
    };

    // Primero enviamos el mensaje de WhatsApp
    const response = await fetch("/api/acuerdopago", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si hay detalles del error, mostrarlos
      if (data.detalles) {
        // Actualizar el carrito si es necesario
        if (data.detalles.existencias === 0) {
          // Remover el producto del carrito si ya no existe
          const newItems = items.filter(item => item.id !== data.detalles.productoId);
          localStorage.setItem("cart", JSON.stringify(newItems));
          window.dispatchEvent(new Event("cartUpdated"));
        } else if (data.detalles.existencias < data.detalles.cantidadSolicitada) {
          // Actualizar la cantidad al máximo disponible
          const newItems = items.map(item => 
            item.id === data.detalles.productoId 
              ? { ...item, cantidad: data.detalles.existencias }
              : item
          );
          localStorage.setItem("cart", JSON.stringify(newItems));
          window.dispatchEvent(new Event("cartUpdated"));
        }
      }
      
      throw new Error(data.error || "Error al procesar el pedido");
    }

    if (!data.whatsappUrl) {
      throw new Error("No se pudo generar el enlace de WhatsApp");
    }

    // Cerramos el toast de carga
    toast.dismiss(loadingToast);
    
    // Mostramos mensaje de éxito
    toast.success("Solicitud de pedido generada. Por favor, confirme a través de WhatsApp.");

    // Abrimos WhatsApp en una nueva pestaña
    window.open(data.whatsappUrl, "_blank");

    // Confirmamos la orden y limpiamos el carrito
    try {
      const confirmResponse = await fetch("/api/acuerdopago/confirmar", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (confirmResponse.ok) {
        // Si la confirmación fue exitosa, limpiamos el carrito
        clearCart();
        toast.success("¡Pedido confirmado exitosamente!");
      } else {
        toast.error("Error al confirmar el pedido. Por favor, contacte al administrador.");
      }
    } catch (confirmError) {
      console.error("Error al confirmar el pedido:", confirmError);
      toast.error("Error al confirmar el pedido. Por favor, contacte al administrador.");
    }

  } catch (error) {
    console.error("Error al generar la solicitud de pedido:", error);
    
    // Cerramos el toast de carga
    toast.dismiss(loadingToast);
    
    // Mostramos el error
    toast.error(error instanceof Error ? error.message : "Error al procesar el pedido");
  }
};

export default function AcuerdoPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cartItems.length === 0) {
      router.push("/catalogo");
      return;
    }
    setItems(cartItems);
    setIsLoading(false);
  }, [isLoading, router]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    toast.success("Dirección seleccionada correctamente");
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AddressSelector
            onSelect={handleAddressSelect}
            selected={selectedAddress}
          />
          <OrderSummary items={items} />
          <div className="flex justify-center lg:col-span-2 mt-8">
            <button
              onClick={() => sendToWhatsApp(items, selectedAddress, clearCart)}
              className="bg-green-500 text-white py-4 px-8 rounded-lg text-lg font-bold flex items-center gap-2 transition-transform transform hover:scale-105 hover:bg-green-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedAddress || items.length === 0}
            >
              <FaWhatsapp className="text-2xl" />
              <span>Enviar Orden por WhatsApp</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
