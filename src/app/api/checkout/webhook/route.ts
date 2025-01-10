import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        
        // Actualizar estado del pedido
        await prisma.pedido.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            estadoPago: "PAGADO",
            estado: "CONFIRMADO",
          },
        });

        // Enviar email de confirmación
        // TODO: Implementar envío de email

        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        
        await prisma.pedido.update({
          where: {
            stripePaymentIntentId: failedPayment.id,
          },
          data: {
            estadoPago: "FALLIDO",
            estado: "CANCELADO",
          },
        });

        // Restaurar inventario
        const pedidoFallido = await prisma.pedido.findUnique({
          where: { stripePaymentIntentId: failedPayment.id },
          include: { items: true },
        });

        if (pedidoFallido) {
          await Promise.all(
            pedidoFallido.items.map((item) =>
              prisma.producto.update({
                where: { id: item.productoId },
                data: {
                  existencias: {
                    increment: item.cantidad,
                  },
                },
              })
            )
          );
        }

        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error en webhook:", error);
    return NextResponse.json(
      { error: "Error al procesar webhook" },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 