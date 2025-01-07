export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Información del producto skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
          </div>

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>

          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
} 