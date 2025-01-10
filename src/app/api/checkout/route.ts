import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { items, direccionId, metodoPagoId } = body;

    // Validar dirección
    const direccion = await prisma.direccion.findUnique({
      where: {
        id: direccionId,
        userId: session.user.id,
      },
    });

    if (!direccion) {
      return NextResponse.json(
        { error: "Dirección no válida" },
        { status: 400 }
      );
    }

    // Validar método de pago
    const metodoPago = metodoPagoId ? await prisma.metodoPago.findUnique({
      where: {
        id: metodoPagoId,
        userId: session.user.id,
      },
    }) : null;

    // Calcular totales
    let subtotal = 0;
    const itemsData = await Promise.all(
      items.map(async (item: { productoId: string; cantidad: number }) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
        });

        if (!producto || !producto.activo) {
          throw new Error(`Producto no disponible: ${item.productoId}`);
        }

        if (producto.existencias < item.cantidad) {
          throw new Error(
            `Stock insuficiente para: ${producto.nombre}`
          );
        }

        const precioFinal = producto.enOferta && producto.precioOferta
          ? producto.precioOferta
          : producto.precio;

        const itemSubtotal = Number(precioFinal) * item.cantidad;
        subtotal += itemSubtotal;

        return {
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnit: precioFinal,
          subtotal: itemSubtotal,
        };
      })
    );

    // Calcular impuestos y envío
    const impuestos = subtotal * 0.16; // 16% IVA
    const costoEnvio = subtotal > 999 ? 0 : 99; // Envío gratis en compras mayores a $999
    const total = subtotal + impuestos + costoEnvio;

    // Crear PaymentIntent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "mxn",
      customer: session.user.stripeCustomerId || undefined,
      payment_method: metodoPago?.stripePaymentMethodId || undefined,
      metadata: {
        userId: session.user.id,
      },
    });

    // Crear pedido en la base de datos
    const pedido = await prisma.pedido.create({
      data: {
        numero: `PED-${Date.now()}`,
        clienteId: session.user.id,
        direccionId,
        metodoPagoId,
        subtotal,
        impuestos,
        costoEnvio,
        total,
        estado: "PENDIENTE",
        estadoPago: "PROCESANDO",
        stripePaymentIntentId: paymentIntent.id,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // Actualizar inventario
    await Promise.all(
      itemsData.map((item) =>
        prisma.producto.update({
          where: { id: item.productoId },
          data: {
            existencias: {
              decrement: item.cantidad,
            },
          },
        })
      )
    );

    return NextResponse.json({
      pedidoId: pedido.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    console.error("Error en checkout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar el pedido" },
      { status: 500 }
    );
  }
} 