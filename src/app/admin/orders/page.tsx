"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import OrderFilters, { OrderFilters as OrderFiltersType } from "./_components/OrderFilters";
import OrdersTable from "./_components/OrdersTable";
import OrderForm from "./_components/OrderForm";
import { Order } from "@/interfaces/Order";
import { 
  FaPlus, 
  FaTimes, 
  FaShoppingBag,
  FaChartLine,
  FaSpinner
} from "react-icons/fa";
import { EstadoPedido } from "@prisma/client";

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<Partial<OrderFiltersType>>({
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 10
  });

  const fetchOrders = useCallback(async (filters: Partial<OrderFiltersType> = {}) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      const mergedFilters = { ...currentFilters, ...filters };

      if (mergedFilters.page) queryParams.set('page', String(mergedFilters.page));
      if (mergedFilters.limit) queryParams.set('limit', String(mergedFilters.limit));
      if (mergedFilters.estado) queryParams.set('estado', mergedFilters.estado);
      if (mergedFilters.busqueda) queryParams.set('busqueda', mergedFilters.busqueda);

      const res = await fetch(`/api/orders?${queryParams}`);
      if (!res.ok) throw new Error('Error al cargar las órdenes');
      const data = await res.json();
      const ordersWithCorrectTypes = data.orders.map((order: Omit<Order, 'estado'> & { estado: string }) => ({
        ...order,
        estado: order.estado as EstadoPedido
      }));
      setOrders(ordersWithCorrectTypes);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar las órdenes');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (filters: Partial<OrderFiltersType>) => {
    setCurrentFilters(prev => ({ ...prev, ...filters }));
    fetchOrders(filters);
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
              <OrderFilters 
                onFilterChange={handleFilterChange}
                totalOrders={pagination.total}
                currentPage={pagination.currentPage}
                totalPages={pagination.pages}
              />
            </div>
            <div className="overflow-x-auto">
              <OrdersTable 
                orders={orders}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
