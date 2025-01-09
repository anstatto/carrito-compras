export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería con efecto de carga */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg animate-pulse overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Información del producto con efecto de carga */}
        <div className="space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl shadow-lg">
          {/* Badges de estado */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-pink-200 dark:bg-pink-800 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-amber-200 dark:bg-amber-800 rounded-full animate-pulse" />
          </div>

          {/* Título y precio */}
          <div className="space-y-4">
            <div className="h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-3/4 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-8 w-32 bg-pink-200 dark:bg-pink-800 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" 
                style={{ width: `${85 + Math.random() * 15}%` }} 
              />
            ))}
          </div>

          {/* Botones y acciones */}
          <div className="space-y-4 pt-4">
            <div className="h-12 bg-gradient-to-r from-pink-300 to-violet-300 dark:from-pink-800 dark:to-violet-800 rounded-lg animate-pulse" />
            <div className="flex justify-between">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 