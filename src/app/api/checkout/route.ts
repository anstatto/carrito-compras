import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { randomUUID } from 'crypto';

interface CheckoutItem {
  id: string;
  cantidad: number;
  precio: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  direccionId: string;
  total: number;
}

// Monto mínimo en DOP (50 pesos dominicanos)
const MIN_AMOUNT_DOP = 50;

// Agregar timeout para pedidos pendientes (15 minutos)
const PENDING_ORDER_TIMEOUT = 15 * 60 * 1000;

export async function POST(req: Request) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Validar datos de entrada
    const body = await req.json() as CheckoutBody;
    if (!body.items?.length || !body.direccionId || !body.total) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Validar monto mínimo
    if (body.total < MIN_AMOUNT_DOP) {
      return NextResponse.json(
        { error: `El monto mínimo de compra es RD$${MIN_AMOUNT_DOP}.00` },
        { status: 400 }
      );
    }

    // 3. Verificar existencias
    const productos = await Promise.all(
      body.items.map(item =>
        prisma.producto.findUnique({
          where: { id: item.id },
          select: { id: true, existencias: true, nombre: true }
        })
      )
    );

    const stockInsuficiente = productos.find((producto, index) => {
      if (!producto) return true;
      return producto.existencias < body.items[index].cantidad;
    });

    if (stockInsuficiente) {
      return NextResponse.json(
        { error: 'Stock insuficiente para algunos productos' },
        { status: 400 }
      );
    }

    // Verificar y limpiar pedidos pendientes antiguos
    const pendingOrder = await prisma.pedido.findFirst({
      where: {
        clienteId: session.user.id,
        estado: 'PENDIENTE',
        estadoPago: 'PENDIENTE',
        creadoEl: {
          // Solo considerar pedidos pendientes de los últimos 15 minutos
          gte: new Date(Date.now() - PENDING_ORDER_TIMEOUT)
        }
      }
    });

    if (pendingOrder) {
      return NextResponse.json(
        { 
          error: 'Ya tienes un pedido pendiente en proceso',
          orderId: pendingOrder.id
        },
        { status: 400 }
      );
    }

    // Limpiar pedidos antiguos pendientes
    await prisma.pedido.updateMany({
      where: {
        clienteId: session.user.id,
        estado: 'PENDIENTE',
        estadoPago: 'PENDIENTE',
        creadoEl: {
          lt: new Date(Date.now() - PENDING_ORDER_TIMEOUT)
        }
      },
      data: {
        estado: 'CANCELADO',
        estadoPago: 'FALLIDO'
      }
    });

    // 4. Crear el pedido
    const order = await prisma.pedido.create({
      data: {
        numero: `ORD-${randomUUID().slice(0, 8)}`,
        clienteId: session.user.id,
        direccionId: body.direccionId,
        subtotal: body.total,
        impuestos: 0,
        costoEnvio: 0,
        total: body.total,
        estado: 'PENDIENTE',
        estadoPago: 'PENDIENTE',
        items: {
          create: body.items.map(item => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnit: item.precio,
            subtotal: item.precio * item.cantidad
          }))
        }
      }
    });

    // 5. Actualizar inventario
    await Promise.all(
      body.items.map(item =>
        prisma.producto.update({
          where: { id: item.id },
          data: {
            existencias: {
              decrement: item.cantidad
            }
          }
        })
      )
    );

    // Crear PaymentIntent en Stripe con monto mínimo ajustado
    const stripeAmount = Math.round(body.total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: 'dop',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        userId: session.user.id
      }
    });

    // 7. Actualizar pedido con ID de PaymentIntent
    await prisma.pedido.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id
      }
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: order.id
    });

  } catch (error) {
    console.error('Error en checkout:', error);
    const message = error instanceof Error ? error.message : 'Error al procesar el pedido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 