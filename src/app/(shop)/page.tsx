import { Suspense } from 'react'

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Bienvenido a nuestra Tienda</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aquí irá el contenido de la tienda */}
          <p>Contenido de la tienda próximamente</p>
        </div>
      </main>
    </Suspense>
  )
} 