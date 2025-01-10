import { memo } from 'react'

// Memoizar componentes de carga para mejor rendimiento
const LoadingCard = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    </div>
    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
    <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
  </div>
))
LoadingCard.displayName = 'LoadingCard'

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-80 animate-pulse" />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 