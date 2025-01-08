'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        {error.message || 'Algo salió mal al cargar el dashboard'}
      </h2>
      <button
        onClick={() => reset()}
        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}