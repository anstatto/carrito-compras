"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import OrdersTable from "./_components/OrdersTable";
import OrderForm from "./_components/OrderForm";
import { Order } from "@/interfaces/Order";
import { 
  FaPlus, 
  FaTimes, 
  FaShoppingBag,
  FaChartLine,
  FaSpinner,
  FaSearch,
  FaCalendar
} from "react-icons/fa";
import { EstadoPedido, TipoPago } from "@prisma/client";
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

interface OrderFilters {
  busqueda: string;
  estado: string;
  metodoPago: string;
  fechaInicio: string;
  fechaFin: string;
  page: number;
  limit: number;
}

interface ApiOrder {
  id: string;
  numero: string;
  estado: string;
  total: number;
  metodoPago: { tipo: TipoPago } | null;
  cliente: {
    nombre: string;
    apellido: string;
    email: string;
  };
  creadoEl: string;
}

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'PREPARANDO', label: 'Preparando' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const METODOS_PAGO = [
  { value: '', label: 'Todos' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'STRIPE', label: 'Stripe' },
]

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    busqueda: searchParams.get('busqueda') || '',
    estado: searchParams.get('estado') || '',
    metodoPago: searchParams.get('metodoPago') || '',
    fechaInicio: searchParams.get('fechaInicio') || new Date().toISOString().split('T')[0],
    fechaFin: searchParams.get('fechaFin') || new Date().toISOString().split('T')[0],
    page: Number(searchParams.get('page')) || 1,
    limit: 10
  });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 10
  });

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.set('page', String(filters.page));
      if (filters.limit) queryParams.set('limit', String(filters.limit));
      if (filters.estado) queryParams.set('estado', filters.estado);
      if (filters.busqueda) queryParams.set('busqueda', filters.busqueda);
      if (filters.metodoPago) queryParams.set('metodoPago', filters.metodoPago);
      if (filters.fechaInicio) queryParams.set('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) queryParams.set('fechaFin', filters.fechaFin);

      const res = await fetch(`/api/orders?${queryParams}`);
      if (!res.ok) throw new Error('Error al cargar las órdenes');
      const data = await res.json();
      
      const ordersWithCorrectTypes = data.orders.map((order: ApiOrder) => ({
        ...order,
        estado: order.estado as EstadoPedido,
        metodoPago: order.metodoPago ? {
          tipo: order.metodoPago.tipo
        } : null
      }));

      setOrders(ordersWithCorrectTypes);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las órdenes');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key: keyof OrderFilters, value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      page: key === 'page' ? Number(value) : 1
    }));
    
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus })
      });

      if (!res.ok) throw new Error("Error al actualizar el estado");
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, estado: newStatus as EstadoPedido } : order
      ));
      
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleUpdatePaymentMethod = async (orderId: string, newPaymentMethod: TipoPago) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metodoPago: newPaymentMethod })
      });

      if (!res.ok) throw new Error("Error al actualizar el método de pago");
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, metodoPago: { tipo: newPaymentMethod } } 
          : order
      ));
      
      toast.success("Método de pago actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el método de pago");
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <FaSpinner className="animate-spin text-4xl text-pink-500" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaShoppingBag className="text-pink-500" />
            Órdenes
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaChartLine className="text-gray-400" />
            <p>Total: {pagination.total} órdenes</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowNewOrder(!showNewOrder)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 
                   text-white rounded-lg hover:shadow-lg transition-all duration-200
                   flex items-center gap-2 w-full md:w-auto justify-center"
        >
          {showNewOrder ? (
            <>
              <FaTimes />
              Cancelar
            </>
          ) : (
            <>
              <FaPlus />
              Nueva Orden
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        {showNewOrder ? (
          <div className="p-6">
            <OrderForm 
              onSuccess={() => {
                setShowNewOrder(false);
                fetchOrders();
              }} 
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número o cliente..."
                    value={filters.busqueda}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('busqueda', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
                
                <div>
                  <select
                    value={filters.estado}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('estado', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  >
                    {ESTADOS.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filters.metodoPago}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('metodoPago', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  >
                    {METODOS_PAGO.map(metodo => (
                      <option key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaInicio', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>

                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaFin', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : (
                <OrdersTable 
                  orders={orders}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdatePaymentMethod={handleUpdatePaymentMethod}
                />
              )}
            </div>
            
            {/* Paginación */}
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Mostrando {Math.min((filters.page - 1) * filters.limit + 1, pagination.total)} - 
                {Math.min(filters.page * filters.limit, pagination.total)} de {pagination.total} órdenes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2">
                  Página {filters.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
