import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

interface ConfirmarBody {
  items: {
    id: string;
    cantidad: number;
    precio: number;
  }[];
  direccionId: string;
  total: number;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sesión no válida" },
        { status: 401 }
      );
    }

    const body = await req.json() as ConfirmarBody;

    // Crear el nuevo pedido
    const order = await prisma.pedido.create({
      data: {
        numero: `ORD-${randomUUID().slice(0, 8)}`,
        clienteId: session.user.id,
        direccionId: body.direccionId,
        subtotal: body.total,
        impuestos: 0,
        costoEnvio: 0,
        total: body.total,
        estado: "PENDIENTE",
        estadoPago: "PENDIENTE",
        items: {
          create: body.items.map(item => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnit: item.precio,
            subtotal: item.precio * item.cantidad,
          })),
        },
      },
    });

    // Actualizar el stock de los productos
    await Promise.all(
      body.items.map(item =>
        prisma.producto.update({
          where: { id: item.id },
          data: { existencias: { decrement: item.cantidad } },
        })
      )
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Pedido confirmado exitosamente",
    });

  } catch (error) {
    console.error("Error al confirmar el pedido:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al confirmar el pedido",
      },
      { status: 500 }
    );
  }
}
