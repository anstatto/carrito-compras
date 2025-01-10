import { MarcaProducto } from '@prisma/client'

export interface Product {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOferta: number | null
  enOferta: boolean
  marca: MarcaProducto
  existencias: number
  slug: string
  categoria: {
    id: string
    nombre: string
    slug: string
  }
  imagenes: {
    url: string
    alt: string | null
  }[]
} 