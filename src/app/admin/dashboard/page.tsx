'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, memo } from 'react'
import { toast } from 'react-hot-toast'
import RecentOrders from '../_components/dashboard/RecentOrders'
import { Card } from '../_components/dashboard/Card'
import { SalesChart } from '../_components/dashboard/SalesChart'
import { TopProducts } from '../_components/dashboard/TopProducts'
import DashboardLoading from './loading'

interface Stats {
  totalPedidos: number
  totalUsuarios: number
  totalProductos: number
  ventasTotal: number
  ventasMes: number
  pedidosPendientes: number
}

// Memoizar las cards para evitar re-renders innecesarios
const StatsCards = memo(({ stats }: { stats: Stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    <Card 
      title="Total Pedidos"
      value={stats.totalPedidos.toString()}
      iconName="FaShoppingCart"
      color="blue"
    />
    <Card 
      title="Pedidos Pendientes"
      value={stats.pedidosPendientes.toString()}
      iconName="FaClock"
      color="yellow"
    />
    <Card 
      title="Ventas del Mes"
      value={`$${stats.ventasMes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
      iconName="FaChartLine"
      color="green"
    />
    <Card 
      title="Ventas Totales"
      value={`$${stats.ventasTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
      iconName="FaDollarSign"
      color="pink"
    />
    <Card 
      title="Total Usuarios"
      value={stats.totalUsuarios.toString()}
      iconName="FaUsers"
      color="indigo"
    />
    <Card 
      title="Total Productos"
      value={stats.totalProductos.toString()}
      iconName="FaBox"
      color="purple"
    />
  </div>
))
StatsCards.displayName = 'StatsCards'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalPedidos: 0,
    totalUsuarios: 0,
    totalProductos: 0,
    ventasTotal: 0,
    ventasMes: 0,
    pedidosPendientes: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Error al cargar estadísticas')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      toast.error('Error al cargar las estadísticas')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchStats()
  }, [session, status, router, fetchStats])

  if (isLoading) return <DashboardLoading />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => fetchStats()}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Actualizar datos
        </button>
      </div>
      
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProducts />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Órdenes Recientes</h2>
        </div>
        <RecentOrders />
      </div>
    </div>
  )
}
