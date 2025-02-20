"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
      (acc, item) => acc + item.precio * item.cantidad,
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

    // Enviamos el mensaje de WhatsApp
    const response = await fetch("/api/acuerdopago", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Manejar errores de inventario
      if (data.detalles) {
        const { existencias, productoId, cantidadSolicitada } = data.detalles;
        
        if (existencias === 0) {
          const newItems = items.filter(item => item.id !== productoId);
          localStorage.setItem("cart", JSON.stringify(newItems));
          window.dispatchEvent(new Event("cartUpdated"));
        } else if (existencias < cantidadSolicitada) {
          const newItems = items.map(item =>
            item.id === productoId
              ? { ...item, cantidad: existencias }
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

    toast.dismiss(loadingToast);
    toast.success("Solicitud de pedido generada. Por favor, confirme a través de WhatsApp.");

    // Abrimos WhatsApp en una nueva pestaña
    window.open(data.whatsappUrl, "_blank");

    // Confirmamos la orden
    const confirmResponse = await fetch("/api/acuerdopago/confirmar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (confirmResponse.ok) {
      clearCart();
      toast.success("¡Pedido confirmado exitosamente!");
    } else {
      toast.error("Error al confirmar el pedido. Por favor, contacte al administrador.");
    }
  } catch (error) {
    console.error("Error al generar la solicitud de pedido:", error);
    toast.dismiss(loadingToast);
    toast.error(error instanceof Error ? error.message : "Error al procesar el pedido");
  }
};

export default function AcuerdoPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      try {
        const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
        if (cartItems.length === 0) {
          router.push("/catalogo");
          return;
        }
        setItems(cartItems);
      } catch (error) {
        console.error("Error loading cart items:", error);
        toast.error("Error al cargar los productos del carrito");
      } finally {
        setIsLoading(false);
      }
    }
  }, [status, router]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
    toast.success("Dirección seleccionada correctamente");
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
    router.push("/catalogo");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return null;
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
