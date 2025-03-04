'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MonthlySales {
  month: string
  total: number
  orders: number
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<MonthlySales[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const res = await fetch('/api/dashboard/sales')
        if (!res.ok) throw new Error('Error al cargar datos de ventas')
        const data = await res.json()
        setSalesData(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  if (isLoading) return <div className="animate-pulse h-[400px] bg-gray-100 rounded-lg"></div>

  const chartData = {
    labels: salesData.map(d => d.month),
    datasets: [
      {
        label: 'Ventas ($)',
        data: salesData.map(d => d.total),
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Órdenes',
        data: salesData.map(d => d.orders),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ventas Mensuales'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Análisis de Ventas</h2>
      <Line data={chartData} options={options} />
    </div>
  )
} 