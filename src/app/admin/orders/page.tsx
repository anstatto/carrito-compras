"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import OrderFilters, { OrderFilters as OrderFiltersType } from "./_components/OrderFilters";
import OrdersTable from "./_components/OrdersTable";
import OrderForm from "./_components/OrderForm";
import { Order } from "@/interfaces/Order";
import OrdersLoading from "./loading";

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
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    currentPage: 1,
    limit: 10
  });

  const fetchOrders = async (filters: Partial<OrderFiltersType> = {}) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: String(filters.page || 1),
        limit: String(filters.limit || 10),
        fechaDesde: filters.fechaDesde?.toISOString() || '',
        fechaHasta: filters.fechaHasta?.toISOString() || ''
      } as Record<string, string>);

      const res = await fetch(`/api/orders?${queryParams}`);
      if (!res.ok) throw new Error("Error al cargar órdenes");
      
      const data = await res.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar las órdenes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilterChange = (filters: OrderFiltersType) => {
    fetchOrders(filters);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus })
      });

      if (!res.ok) throw new Error("Error al actualizar estado");
      
      toast.success("Estado actualizado correctamente");
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado");
    }
  };

  if (isLoading) return <OrdersLoading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
          <p className="text-sm text-gray-500">
            Gestiona y monitorea todas las órdenes
          </p>
        </div>
        
        <button
          onClick={() => setShowNewOrder(!showNewOrder)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 
                   text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          {showNewOrder ? "Cancelar" : "Nueva Orden"}
        </button>
      </div>

      {showNewOrder ? (
        <OrderForm onSuccess={() => {
          setShowNewOrder(false);
          fetchOrders();
        }} />
      ) : (
        <>
          <OrderFilters 
            onFilterChange={handleFilterChange}
            totalOrders={pagination.total}
            currentPage={pagination.currentPage}
            totalPages={pagination.pages}
          />
          <OrdersTable 
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
          />
        </>
      )}
    </div>
  );
}
