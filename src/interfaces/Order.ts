import { ProvinciaRD, AgenciaEnvio, EstadoPago, TipoPago, EstadoPedido } from "@prisma/client"

interface Direccion {
  id?: string
  calle: string
  numero: string
  sector: string
  provincia: ProvinciaRD
  municipio: string
  telefono: string
  predeterminada: boolean
  userId: string
  codigoPostal?: string
  referencia?: string
  celular?: string
  agenciaEnvio?: AgenciaEnvio
  sucursalAgencia?: string
}

export interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  direccion?: Direccion
}

// interface Producto {
//   id: string
//   nombre: string
//   precio: number
//   existencias: number
// }

export interface OrderItem {
  id: string
  cantidad: number
  precioUnit: number
  subtotal: number
  enOferta: boolean
  precioRegular: number | null
  precioOferta: number | null
  porcentajeDescuento: number | null
  producto: {
    id: string
    nombre: string
    sku: string
    precio: number
    marca: string
    imagenes?: Array<{ url: string }>
  }
}

interface MetodoPago {
  tipo: TipoPago
}

export interface Order {
  id: string
  numero: string
  clienteId: string
  cliente: Cliente
  subtotal: number
  impuestos: number
  costoEnvio: number
  total: number
  estado: EstadoPedido
  estadoPago: EstadoPago
  metodoPago: MetodoPago | null
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
  items?: Array<OrderItem>
  creadoEl: string | Date | null
  actualizadoEl: string | Date | null
} 