import React from 'react';
import Image from 'next/image'

// Puedes usar async si necesitas fetch de datos
async function ProductsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Aquí puedes mapear tus productos */}
        {/* Ejemplo de estructura de producto */}
        <div className="border rounded-lg p-4 shadow-md">
          <div className="relative h-48">
            <Image 
              src="/placeholder-product.jpg" 
              alt="Producto" 
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h2 className="text-xl font-semibold mt-2">Nombre del Producto</h2>
          <p className="text-gray-600">$99.99</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Agregar al Carrito
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProductsPage;
