import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  console.log("🔔 Webhook recibido");

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  try {
    console.log("Verificando firma del webhook...");
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("Evento recibido:", event.type);

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("💰 Pago exitoso:", paymentIntent.id);

        try {
          // Verificar si el pedido ya fue procesado
          const existingOrder = await prisma.pedido.findFirst({
            where: {
              stripePaymentIntentId: paymentIntent.id,
              OR: [{ estadoPago: "PAGADO" }, { estadoPago: "PROCESANDO" }],
            },
          });

          if (existingOrder) {
            console.log(`⚠️ Pago ya procesado: ${paymentIntent.id}`);
            return NextResponse.json({ received: true });
          }

          console.log("📦 Procesando pedido:", paymentIntent.id);

          // Actualizar estado del pedido
          const order = await prisma.pedido.update({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              estadoPago: "PAGADO",
              estado: "CONFIRMADO",
            },
            include: {
              cliente: true,
              items: {
                include: { producto: true },
              },
            },
          });

          console.log(`✅ Pedido ${order.numero} actualizado correctamente`);

          // Enviar email de confirmación
          console.log("📧 Intentando enviar email...");
          try {
            const emailResult = await sendOrderConfirmationEmail(
              {
                numero: order.numero,
                items: order.items.map((item) => ({
                  producto: {
                    nombre: item.producto.nombre,
                    precio: Number(item.producto.precio),
                  },
                  cantidad: item.cantidad,
                })),
                total: Number(order.total),
              },
              {
                email: order.cliente.email,
                name: order.cliente.nombre || order.cliente.email.split("@")[0],
              }
            );

            console.log("📨 Email enviado:", {
              messageId: emailResult?.messageId,
              to: order.cliente.email,
              orderNumber: order.numero,
            });
          } catch (emailError) {
            console.error("❌ Error al enviar email:", {
              error: emailError,
              orderNumber: order.numero,
              customerEmail: order.cliente.email,
            });
          }
        } catch (error) {
          console.error("❌ Error procesando el pedido:", error);
          throw error;
        }
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
    console.error("❌ Error en webhook:", error);
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
