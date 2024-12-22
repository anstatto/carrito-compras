interface ProductInfoProps {
  producto: any // Ajusta el tipo según tu modelo
  addToCartButton: React.ReactNode
}

export default function ProductInfo({ producto, addToCartButton }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {producto.nombre}
      </h1>
      
      <p className="text-2xl font-semibold text-pink-600 dark:text-pink-400">
        ${producto.precio.toFixed(2)}
      </p>
      
      <div className="prose dark:prose-invert max-w-none">
        <p>{producto.descripcion}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm ${
          producto.existencias > 0 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {producto.existencias > 0 ? 'En stock' : 'Agotado'}
        </span>
        
        {producto.categoria && (
          <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            {producto.categoria.nombre}
          </span>
        )}
      </div>

      {addToCartButton}
    </div>
  )
} 