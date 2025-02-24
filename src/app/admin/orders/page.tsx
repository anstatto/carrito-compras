"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OrdersLoading from "./loading";
import PrintOrder from "./_components/PrintOrder";

interface Order {
  id: string;
  numero: string;
  clienteId: string;
  cliente: {
    nombre: string;
    email: string;
  };
  total: number;
  estado: "PENDIENTE" | "PAGADO" | "PREPARANDO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";
  metodoPago: string;
  creadoEl: string;
  items: Array<{
    cantidad: number;
    precioUnit: number;
    subtotal: number;
    producto: {
      nombre: string;
      imagenes: Array<{ url: string }>;
    };
  }>;
}

const getStatusColor = (status: Order["estado"]): string => {
  const colors = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    PAGADO: "bg-blue-100 text-blue-800",
    PREPARANDO: "bg-purple-100 text-purple-800",
    ENVIADO: "bg-indigo-100 text-indigo-800",
    ENTREGADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Memoizar componentes para mejor rendimiento
const OrderRow = memo(
  ({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: Order["estado"]) => Promise<void> }) => {
    const statusColor = getStatusColor(order.estado);

    return (
      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50 transition-colors duration-200">
        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
          <div className="text-xs md:text-sm font-medium text-gray-900">{order.numero}</div>
        </td>
        <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
          <div className="text-xs md:text-sm font-medium text-gray-900">{order.cliente.nombre}</div>
          <div className="text-xs md:text-sm text-gray-500">{order.cliente.email}</div>
        </td>
        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
          ${order.total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>{order.estado}</span>
        </td>
        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden lg:table-cell">{order.metodoPago}</td>
        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
          {new Date(order.creadoEl).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
        </td>
        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
          <div className="flex items-center gap-2 md:gap-3">
            <PrintOrder order={order} />
            <button onClick={() => onUpdateStatus(order.id, "PREPARANDO")} className="text-blue-600 hover:text-blue-900 transition-colors duration-200" title="Marcar como en preparación">
              <FaCheck className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
                  onUpdateStatus(order.id, "CANCELADO");
                }
              }}
              className="text-red-600 hover:text-red-900 transition-colors duration-200"
              title="Cancelar pedido"
            >
              <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  }
);
OrderRow.displayName = "OrderRow";

const SearchBar = memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="relative">
    <input type="text" placeholder="Buscar pedido..." value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 pl-10 rounded-lg border focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
  </div>
));
SearchBar.displayName = "SearchBar";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [estadoFilter] = useState<string>(""); // Para filtrar por estado
  const [metodoPagoFilter] = useState<string>(""); // Para filtrar por método de pago
  const [fechaDesdeFilter] = useState<string>(""); // Para filtrar por fecha desde
  const [fechaHastaFilter] = useState<string>(""); // Para filtrar por fecha hasta

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const url = new URL("/api/orders", window.location.origin);

      if (searchTerm) {
        url.searchParams.append("clienteNombre", searchTerm);
      }
      if (estadoFilter) {
        url.searchParams.append("estado", estadoFilter);
      }
      if (metodoPagoFilter) {
        url.searchParams.append("metodoPago", metodoPagoFilter);
      }
      if (fechaDesdeFilter) {
        url.searchParams.append("fechaDesde", fechaDesdeFilter);
      }
      if (fechaHastaFilter) {
        url.searchParams.append("fechaHasta", fechaHastaFilter);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error("Error al cargar los pedidos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, estadoFilter, metodoPagoFilter, fechaDesdeFilter, fechaHastaFilter]);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: Order["estado"]) => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: newStatus }),
        });

        if (!res.ok) throw new Error("Error al actualizar el pedido");

        toast.success("Estado del pedido actualizado correctamente");
        await fetchOrders();
      } catch (error) {
        toast.error("Error al actualizar el estado del pedido");
        console.error(error);
      }
    },
    [fetchOrders]
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    fetchOrders();
  }, [session, status, router, fetchOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <OrdersLoading />;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Pedidos</h1>
      </div>

      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Cliente</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Método de Pago</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Fecha</th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
