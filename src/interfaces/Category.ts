export interface CategoryFormData {
  id?: string
  nombre: string
  descripcion: string
  imagen: string | null
  slug: string
  activa: boolean
}

export interface Category extends CategoryFormData {
  id: string
  creadoEl: string
  actualizadoEl: string
} 