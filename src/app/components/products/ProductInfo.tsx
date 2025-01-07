interface ProductInfoProps {
  producto: {
    nombre: string
    descripcion: string
    precio: number
    precioOferta?: number | null
    enOferta: boolean
    marca?: string | null
    existencias: number
    categoria: {
      nombre: string
    }
  }
  addToCartButton: React.ReactNode
}

export default function ProductInfo({ producto, addToCartButton }: ProductInfoProps) {
  const precioFinal = producto.enOferta && producto.precioOferta 
    ? producto.precioOferta 
    : producto.precio

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
        {producto.marca && (
          <p className="text-gray-500">{producto.marca}</p>
        )}
      </div>

      <div className="flex items-baseline gap-4">
        <span className="text-2xl font-bold text-gray-900">
          ${precioFinal.toFixed(2)}
        </span>
        {producto.enOferta && producto.precioOferta && (
          <span className="text-lg text-gray-500 line-through">
            ${producto.precio.toFixed(2)}
          </span>
        )}
      </div>

      <p className="text-gray-600">{producto.descripcion}</p>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Categoría:</span>
          <span className="text-gray-600">{producto.categoria.nombre}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">Disponibilidad:</span>
          <span className={producto.existencias > 0 ? 'text-green-600' : 'text-red-600'}>
            {producto.existencias > 0 ? 'En stock' : 'Agotado'}
          </span>
        </div>
      </div>

      {addToCartButton}
    </div>
  )
} 