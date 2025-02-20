// File: /app/api/acuerdopago/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { jsPDF } from "jspdf";
import fs from "fs/promises";
import path from "path";

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
 * Genera un reporte PDF de la orden con un formato mejorado, incluyendo encabezado,
 * datos del cliente, dirección y una tabla de ítems.
 * @param orderDetails - Los detalles de la orden.
 * @returns La ruta del archivo PDF generado.
 */
const generatePDF = async (orderDetails: OrderDetails): Promise<string> => {
  const doc = new jsPDF();

  // Encabezado principal
  doc.setFontSize(18);
  doc.text("Orden de Compra", 105, 15, { align: "center" });

  // Información de la orden
  doc.setFontSize(12);
  doc.text(`Número de Orden: ${orderDetails.id}`, 20, 25);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 32);

  // Datos del cliente
  doc.text(`Cliente: ${orderDetails.cliente.nombre}`, 20, 40);
  doc.text(`Email: ${orderDetails.cliente.email}`, 20, 47);

  // Datos de la dirección
  doc.text("Dirección de Envío:", 20, 55);
  doc.text(
    `${orderDetails.direccion.calle}, ${orderDetails.direccion.municipio}, ${orderDetails.direccion.provincia}`,
    20,
    62
  );
  if (orderDetails.direccion.codigoPostal) {
    doc.text(`Código Postal: ${orderDetails.direccion.codigoPostal}`, 20, 69);
  }

  // Línea separadora
  doc.line(20, 75, 190, 75);

  // Encabezado de la tabla de ítems
  doc.text("Producto", 20, 85);
  doc.text("Cantidad", 100, 85);
  doc.text("Precio Unitario", 130, 85);
  doc.text("Subtotal", 170, 85);

  // Lista de ítems
  let yOffset = 95;
  orderDetails.items.forEach((item) => {
    const { nombre, precio } = item.producto;
    const subtotal = item.cantidad * precio;
    doc.text(nombre, 20, yOffset);
    doc.text(`${item.cantidad}`, 100, yOffset);
    doc.text(`RD$${precio.toFixed(2)}`, 130, yOffset);
    doc.text(`RD$${subtotal.toFixed(2)}`, 170, yOffset);
    yOffset += 8;
  });

  // Cálculo y muestra del total
  const totalAmount = orderDetails.items.reduce(
    (acc, item) => acc + item.cantidad * item.producto.precio,
    0
  );
  doc.setFontSize(14);
  doc.text(`Total: RD$${totalAmount.toFixed(2)}`, 20, yOffset + 10);

  // Crear directorio temporal para almacenar el PDF
  const tempDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(tempDir, { recursive: true });
  const filePath = path.join(tempDir, `${orderDetails.id}.pdf`);

  // Generar y escribir el PDF
  const pdfBuffer = doc.output("arraybuffer");
  await fs.writeFile(filePath, Buffer.from(pdfBuffer));
  console.log(`PDF generado en: ${filePath}`);
  return filePath;
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

    // Obtener detalles completos de la orden y generar el PDF
    const orderDetails = await getOrderDetails(order.id);
    if (!orderDetails) {
      throw new Error("No se pudo obtener los detalles del pedido");
    }
    const pdfPath = await generatePDF(orderDetails);
    console.log(`PDF Path: ${pdfPath}`);

    return NextResponse.json({ pdfUrl: pdfPath }, { status: 200 });
  } catch (error) {
    console.error("Error en checkout:", error);
    const message =
      error instanceof Error ? error.message : "Error al procesar el pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
