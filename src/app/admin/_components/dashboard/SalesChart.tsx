'use client'

import { useEffect, useState } from 'react'
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

interface SalesData {
  labels: string[]
  data: number[]
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData>({ labels: [], data: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      const res = await fetch('/api/dashboard/sales')
      if (!res.ok) throw new Error('Error al cargar datos de ventas')
      const data = await res.json()
      setSalesData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: salesData.labels,
    datasets: [
      {
        label: 'Ventas',
        data: salesData.data,
        fill: true,
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        tension: 0.4
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Ventas últimos 7 días'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Line data={chartData} options={options} />
    </div>
  )
} 