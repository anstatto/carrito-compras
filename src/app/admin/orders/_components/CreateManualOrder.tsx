'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { AgenciaEnvio, ProvinciaRD, TipoPago } from '@prisma/client'
import ProductTable from './ProductTable'
import PaymentSelector from './PaymentSelector'
import OrderSummary from './OrderSummary'
import { Product } from '@/app/types'

interface ManualOrderForm {
  nombreCliente: string
  emailCliente: string
  telefonoCliente: string
  // Dirección
  calle: string
  numero: string
  sector: string
  provincia: ProvinciaRD
  municipio: string
  referencia?: string
  telefono: string
  celular?: string
  agenciaEnvio?: AgenciaEnvio
  sucursalAgencia?: string
}

export default function CreateManualOrder() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [paymentType, setPaymentType] = useState<TipoPago>(TipoPago.EFECTIVO)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ManualOrderForm>()

  const total = selectedProducts.reduce((acc, p) => {
    const precio = typeof p.precio === 'string' ? parseFloat(p.precio) : p.precio
    return acc + (precio * (p.cantidad || 1))
  }, 0)

  const onSubmit = async (data: ManualOrderForm) => {
    if (selectedProducts.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }

    try {
      setIsLoading(true)
      
      const orderData = {
        nombreCliente: data.nombreCliente,
        emailCliente: data.emailCliente,
        telefonoCliente: data.telefonoCliente,
        // Datos de dirección
        calle: data.calle,
        numero: data.numero,
        sector: data.sector,
        provincia: data.provincia,
        municipio: data.municipio,
        referencia: data.referencia,
        telefono: data.telefono,
        celular: data.celular,
        agenciaEnvio: data.agenciaEnvio,
        sucursalAgencia: data.sucursalAgencia,
        // Datos del pedido
        esManual: true,
        productos: selectedProducts.map(p => ({
          id: p.id,
          cantidad: p.cantidad || 1
        })),
        metodoPago: paymentType
      }

      console.log('Enviando datos:', orderData)
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al crear el pedido')
      }

      toast.success('Pedido creado correctamente')
      reset()
      setSelectedProducts([])
    } catch (error) {
      console.error('Error completo:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nombre del Cliente"
              {...register('nombreCliente', { required: true })}
              error={errors.nombreCliente?.message}
            />
          </div>
          <div>
            <Input
              label="Email"
              type="email"
              {...register('emailCliente', { required: true })}
              error={errors.emailCliente?.message}
            />
          </div>
          <div>
            <Input
              label="Teléfono"
              {...register('telefonoCliente', { required: true })}
              error={errors.telefonoCliente?.message}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold mb-4">Dirección de Envío</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Calle"
              {...register('calle', { required: true })}
              error={errors.calle?.message}
            />
          </div>
          <div>
            <Input
              label="Número"
              {...register('numero', { required: true })}
              error={errors.numero?.message}
            />
          </div>
          <div>
            <Input
              label="Sector"
              {...register('sector', { required: true })}
              error={errors.sector?.message}
            />
          </div>
          <div>
            <Select
              label="Provincia"
              {...register('provincia', { required: true })}
              error={errors.provincia?.message}
            >
              {Object.values(ProvinciaRD).map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Input
              label="Municipio"
              {...register('municipio', { required: true })}
              error={errors.municipio?.message}
            />
          </div>
          <div>
            <Input
              label="Referencia"
              {...register('referencia')}
              error={errors.referencia?.message}
            />
          </div>
          <div>
            <Select
              label="Agencia de Envío"
              {...register('agenciaEnvio')}
              error={errors.agenciaEnvio?.message}
            >
              <option value="">Seleccionar agencia...</option>
              {Object.values(AgenciaEnvio).map((agencia) => (
                <option key={agencia} value={agencia}>
                  {agencia.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Input
              label="Sucursal de Agencia"
              {...register('sucursalAgencia')}
              error={errors.sucursalAgencia?.message}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        <ProductTable 
          products={selectedProducts} 
          onUpdate={setSelectedProducts}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
        <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
        <PaymentSelector 
          value={paymentType}
          onChange={setPaymentType}
        />
      </div>

      <OrderSummary
        total={total}
        onSave={handleSubmit(onSubmit)}
        isSubmitting={isLoading}
      />
    </form>
  )
} 