// File: /app/api/acuerdopago/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

interface AcuerdoItem {
  id: string;
  cantidad: number;
  precio: number;
  nombre?: string;
}

interface AcuerdoBody {
  items: AcuerdoItem[];
  direccionId: string;
  total: number;
}

interface Cliente {
  nombre: string;
  email: string;
}

interface Direccion {
  calle: string;
  provincia: string;
  municipio: string;
  codigoPostal: string | null;
}

interface Producto {
  nombre: string;
  precio: number;
}

interface Item {
  cantidad: number;
  producto: Producto;
}

interface OrderDetails {
  id: string;
  cliente: Cliente;
  direccion: Direccion;
  items: Item[];
}

const MIN_AMOUNT_DOP = 50;
const PENDING_ORDER_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos

/**
 * Obtiene los detalles completos de un pedido, incluyendo cliente, dirección e ítems.
 * @param orderId - El ID del pedido.
 * @returns Los detalles del pedido o null si no se encuentra.
 */
const getOrderDetails = async (
  orderId: string
): Promise<OrderDetails | null> => {
  return (await prisma.pedido.findUnique({
    where: { id: orderId },
    include: {
      cliente: { select: { nombre: true, email: true } },
      direccion: {
        select: {
          calle: true,
          provincia: true,
          municipio: true,
          codigoPostal: true,
        },
      },
      items: {
        include: {
          producto: { select: { nombre: true, precio: true } },
        },
      },
    },
  })) as OrderDetails | null;
};

/**
 * Genera un mensaje de texto con los detalles del pedido para enviar por WhatsApp.
 * @param orderDetails - Los detalles del pedido.
 * @returns El enlace de WhatsApp con el mensaje.
 */
const generateWhatsAppMessage = (orderDetails: OrderDetails): string => {
  let message = `*Orden de Compra*\n`;
  message += `Número de Orden: ${orderDetails.id}\n`;
  message += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

  // Datos del cliente
  message += `*Cliente:* ${orderDetails.cliente.nombre}\n`;
  message += `*Email:* ${orderDetails.cliente.email}\n\n`;

  // Datos de la dirección
  message += `*Dirección de Envío:*\n`;
  message += `${orderDetails.direccion.calle}, ${orderDetails.direccion.municipio}, ${orderDetails.direccion.provincia}\n`;
  if (orderDetails.direccion.codigoPostal) {
    message += `Código Postal: ${orderDetails.direccion.codigoPostal}\n`;
  }

  // Lista de ítems
  message += `\n*Productos:* \n`;
  orderDetails.items.forEach((item) => {
    const { nombre, precio } = item.producto;
    const subtotal = item.cantidad * precio;
    message += `${nombre} - Cantidad: ${item.cantidad} - Precio: RD$${precio.toFixed(2)} - Subtotal: RD$${subtotal.toFixed(2)}\n`;
  });

  // Total
  const totalAmount = orderDetails.items.reduce(
    (acc, item) => acc + item.cantidad * item.producto.precio,
    0
  );
  message += `\n*Total:* RD$${totalAmount.toFixed(2)}`;

  // URL de WhatsApp con el mensaje
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = "+1XXXXXXXXXX"; // Aquí debes colocar el número de teléfono al que deseas enviar el mensaje.
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export async function POST(req: Request) {
  try {
    // Validar sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Extraer y validar el cuerpo de la solicitud
    const body = (await req.json()) as AcuerdoBody;
    if (
      !body.items ||
      body.items.length === 0 ||
      !body.direccionId ||
      !body.total
    ) {
      return NextResponse.json(
        { error: "Datos incompletos", body },
        { status: 400 }
      );
    }
    if (body.total < MIN_AMOUNT_DOP) {
      return NextResponse.json(
        { error: `El monto mínimo de compra es RD$${MIN_AMOUNT_DOP}.00`, body },
        { status: 400 }
      );
    }

    // Verificar existencias de cada producto
    const productos = await Promise.all(
      body.items.map((item) =>
        prisma.producto.findUnique({
          where: { id: item.id },
          select: { id: true, existencias: true, nombre: true },
        })
      )
    );
    const stockInsuficiente = productos.find((producto, index) => {
      if (!producto) return true;
      return producto.existencias < body.items[index].cantidad;
    });
    if (stockInsuficiente) {
      return NextResponse.json(
        { error: "Stock insuficiente para algunos productos", body },
        { status: 400 }
      );
    }

    // Verificar si existe un pedido pendiente
    const pendingOrder = await prisma.pedido.findFirst({
      where: {
        clienteId: session.user.id,
        estado: "PENDIENTE",
        estadoPago: "PENDIENTE",
        creadoEl: { gte: new Date(Date.now() - PENDING_ORDER_TIMEOUT) },
      },
    });
    if (pendingOrder) {
      return NextResponse.json(
        {
          error: "Ya tienes un pedido pendiente en proceso",
          orderId: pendingOrder.id,
          body,
        },
        { status: 400 }
      );
    }

    // Cancelar pedidos pendientes que excedan el tiempo límite
    await prisma.pedido.updateMany({
      where: {
        clienteId: session.user.id,
        estado: "PENDIENTE",
        estadoPago: "PENDIENTE",
        creadoEl: { lt: new Date(Date.now() - PENDING_ORDER_TIMEOUT) },
      },
      data: {
        estado: "CANCELADO",
        estadoPago: "FALLIDO",
      },
    });

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
          create: body.items.map((item) => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnit: item.precio,
            subtotal: item.precio * item.cantidad,
          })),
        },
      },
    });

    // Actualizar el stock de los productos adquiridos
    await Promise.all(
      body.items.map((item) =>
        prisma.producto.update({
          where: { id: item.id },
          data: { existencias: { decrement: item.cantidad } },
        })
      )
    );

    // Obtener detalles completos de la orden
    const orderDetails = await getOrderDetails(order.id);
    if (!orderDetails) {
      throw new Error("No se pudo obtener los detalles del pedido");
    }

    // Generar el mensaje de WhatsApp
    const whatsappUrl = generateWhatsAppMessage(orderDetails);

    return NextResponse.json({ whatsappUrl }, { status: 200 });
  } catch (error) {
    console.error("Error en checkout:", error);
    const message =
      error instanceof Error ? error.message : "Error al procesar el pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
