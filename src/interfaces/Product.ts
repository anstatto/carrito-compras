export interface ProductFormData {
  id?: string
  nombre: string
  descripcion: string
  precio: number
  categoriaId: string
  existencias: number
  stockMinimo: number
  imagenes: string[]
  activo: boolean
  sku: string
  slug: string
}

export interface Product extends ProductFormData {
  id: string
  categoria: {
    id: string
    nombre: string
  }
  imagenes: {
    url: string
    alt?: string
  }[]
  creadoEl: string
  actualizadoEl: string
} 