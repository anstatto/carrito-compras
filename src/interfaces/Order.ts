import {  Decimal } from "@prisma/client/runtime/library"
import { ProvinciaRD, AgenciaEnvio, EstadoPago, TipoPago, EstadoPedido } from "@prisma/client"

export interface Order {
  id: string
  numero: string
  clienteId: string
  cliente: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono: string | null
  }
  subtotal: number | Decimal
  impuestos: number | Decimal
  costoEnvio: number | Decimal
  total: number | Decimal
  estado: EstadoPedido
  estadoPago: EstadoPago
  metodoPago: {
    id: string
    tipo: TipoPago
    ultimosDigitos: string | null
    marca: string | null
    userId: string
    predeterminado: boolean
    stripePaymentMethodId: string | null
    creadoEl: string
    actualizadoEl: string
  } | null
  direccion: {
    calle: string
    numero: string
    sector: string
    provincia: ProvinciaRD
    municipio: string
    codigoPostal: string | null
    referencia: string | null
    telefono: string
    agenciaEnvio: AgenciaEnvio | null
    sucursalAgencia: string | null
  }
  items?: Array<{
    id: string
    cantidad: number
    precioUnit: number | Decimal
    subtotal: number | Decimal
    creadoEl: string
    producto: {
      id: string
      nombre: string
      sku: string
      precio: number | Decimal
      imagenes: Array<{ url: string }>
      marca: string
    }
  }>
  creadoEl: string
  actualizadoEl: string
} 