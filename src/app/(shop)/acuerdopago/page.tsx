"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MarcaProducto } from "@prisma/client";
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
  marca: MarcaProducto;
  existencias: number;
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

  const loadingToast = toast.loading("Generando solicitud de pedido...");

  try {
    const total = items.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    const orderData = {
      items: items.map(({ id, cantidad, precio, marca, nombre }) => ({
        id,
        cantidad,
        precio: Number(precio),
        marca,
        nombre
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
      if (data.detalles?.productoId) {
        const { existencias, productoId } = data.detalles;
        
        const newItems = items.map(item =>
          item.id === productoId && item.cantidad > existencias
            ? { ...item, cantidad: Math.max(1, existencias) }
            : item
        ).filter(item => item.cantidad > 0);

        if (newItems.length !== items.length) {
          localStorage.setItem("cart", JSON.stringify(newItems));
          window.dispatchEvent(new Event("cartUpdated"));
          toast.error(`Algunos productos fueron actualizados debido a cambios en el inventario`);
        }
      }
      throw new Error(data.error || "Error al procesar el pedido");
    }

    toast.dismiss(loadingToast);
    toast.success("¡Pedido generado! Abriendo WhatsApp...");

    // Confirmamos la orden primero
    try {
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
        
        // Abrimos WhatsApp después de confirmar
        if (data.whatsappUrl) {
          // Detectar si es iOS
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            // En iOS, usamos window.location.href en lugar de window.open
            window.location.href = data.whatsappUrl;
          } else {
            window.open(data.whatsappUrl, "_blank");
          }
        }
      }
    } catch (confirmError) {
      console.error("Error al confirmar el pedido:", confirmError);
      // Aún abrimos WhatsApp aunque falle la confirmación
      if (data.whatsappUrl) {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          window.location.href = data.whatsappUrl;
        } else {
          window.open(data.whatsappUrl, "_blank");
        }
      }
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
    const checkAuth = async () => {
      if (status === "unauthenticated") {
        // Guardar la URL actual para redireccionar después del login
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        router.push("/login");
        return;
      }

      if (status === "authenticated") {
        try {
          const cartData = localStorage.getItem("cart");
          if (!cartData) {
            router.push("/catalogo");
            return;
          }

          const cartItems = JSON.parse(cartData);
          if (cartItems.length === 0) {
            router.push("/catalogo");
            return;
          }

          setItems(cartItems);
        } catch (error) {
          console.error("Error loading cart items:", error);
          toast.error("Error al cargar los productos del carrito");
          router.push("/carrito");
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [status, router]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
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
