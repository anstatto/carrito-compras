'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Ha ocurrido un error inesperado'}
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Intentar de nuevo
          </button>
          <a
            href="/admin/dashboard"
            className="inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}