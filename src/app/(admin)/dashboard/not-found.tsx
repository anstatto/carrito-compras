import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-6">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  )
} 