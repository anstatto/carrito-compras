"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

const PHONE_NUMBER = "18297828831"; // Número de WhatsApp

const sendToWhatsApp = async (
  items: CartItem[],
  selectedAddress: string,
  clearCart: () => void
) => {
  if (!selectedAddress) {
    toast.error("Por favor, selecciona una dirección antes de continuar.");
    return;
  }

  try {
    const response = await fetch("/api/acuerdopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(({ id, cantidad, precio }) => ({
          id,
          cantidad,
          precio,
        })),
        direccionId: selectedAddress,
        total: items.reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        ),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al generar el reporte");
    }

    const { pdfUrl } = await response.json();
    clearCart();

    const message = `Aquí está tu orden de compra: ${pdfUrl}`;
    window.open(
      `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  } catch (error) {
    //console.error("Error al enviar la orden por WhatsApp:", error);
    toast.error(`Error al enviar la orden: ${error}`);
  }
};

export default function AcuerdoPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cartItems.length === 0) {
      router.push("/catalogo");
      return;
    }
    setItems(cartItems);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleAddressSelect = (addressId: string) =>
    setSelectedAddress(addressId);

  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* El Toaster se encargará de mostrar los toast */}
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
              className="bg-green-500 text-white py-4 px-8 rounded-lg text-lg font-bold flex items-center gap-2 transition-transform transform hover:scale-105 hover:bg-green-600 shadow-lg"
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
