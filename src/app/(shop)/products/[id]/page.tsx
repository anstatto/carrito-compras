import Image from 'next/image'

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  // Aquí irá tu lógica para obtener el producto específico
  // Por ahora retornamos datos de ejemplo
  return {
    id,
    name: "Producto de Ejemplo",
    description: "Descripción detallada del producto...",
    price: 99.99,
    image: "/placeholder-product.jpg"
  };
}

async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Imagen del producto */}
        <div className="relative aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-lg shadow-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Detalles del producto */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-600">
            ${product.price}
          </p>
          <p className="text-gray-600">{product.description}</p>
          
          {/* Botones de acción */}
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Agregar al Carrito
            </button>
            <button className="w-full border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
              Agregar a Favoritos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
