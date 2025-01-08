'use client'

import RecentOrders from '../_components/dashboard/RecentOrders'
import { Card } from '../_components/dashboard/Card'
import { SalesChart } from '../_components/dashboard/SalesChart'
import { TopProducts } from '../_components/dashboard/TopProducts'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Stats {
  totalPedidos: number
  totalUsuarios: number
  totalProductos: number
  ventasTotal: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalPedidos: 0,
    totalUsuarios: 0,
    totalProductos: 0,
    ventasTotal: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
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
  }

  if (isLoading) {
    return <div className="p-6">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Pedidos"
          value={stats.totalPedidos.toString()}
          iconName="FaShoppingCart"
          color="blue"
        />
        <Card 
          title="Total Usuarios"
          value={stats.totalUsuarios.toString()}
          iconName="FaUsers"
          color="green"
        />
        <Card 
          title="Total Productos"
          value={stats.totalProductos.toString()}
          iconName="FaBox"
          color="purple"
        />
        <Card 
          title="Ventas Totales"
          value={`$${stats.ventasTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
          iconName="FaDollarSign"
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProducts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
      </div>
    </div>
  )
}
