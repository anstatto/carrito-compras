export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse overflow-hidden">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse overflow-hidden">
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 animate-pulse" />
          </div>

          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" 
                style={{ width: `${85 + Math.random() * 15}%` }} 
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
} 