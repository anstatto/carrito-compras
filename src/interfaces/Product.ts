export interface ProductImage {
  url: string
  alt: string | null
}

export interface ProductFormData {
  id?: string
  nombre: string
  descripcion: string
  precio: number
  existencias: number
  stockMinimo: number
  categoriaId: string
  imagenes: ProductImage[]
  activo: boolean
  enOferta: boolean
  precioOferta?: number | null
  destacado: boolean
  sku?: string
  slug?: string
}

export interface Product extends ProductFormData {
  id: string
  categoria: {
    id: string
    nombre: string
    slug: string
  }
  creadoEl: string
  actualizadoEl: string
}

// Interfaz específica para mostrar productos en la tienda
export interface ProductView {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOferta: number | null
  enOferta: boolean
  imagenes: {
    url: string
    alt: string | null
  }[]
  slug: string
  categoria: {
    id: string
    nombre: string
    slug: string
  }
  existencias: number
} 