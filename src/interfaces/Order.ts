import { TipoPago } from "@prisma/client"

export interface Order {
  id: string
  numero: string
  clienteId: string
  cliente: {
    nombre: string
    email: string
  }
  total: number
  estado: 'PENDIENTE' | 'PAGADO' | 'PREPARANDO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'
  metodoPago: {
    tipo: TipoPago
  }
  creadoEl: Date
  items: Array<{
    id: string
    cantidad: number
    precioUnit: number
    subtotal: number
    producto: {
      nombre: string
      imagenes: Array<{ url: string }>
    }
  }>
} 