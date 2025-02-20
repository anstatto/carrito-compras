// File: /app/api/acuerdopago/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AcuerdoItem {
  id: string;
  cantidad: number;
  precio: number;
}

interface AcuerdoBody {
  items: AcuerdoItem[];
  direccionId: string;
  total: number;
}

interface ProductoInfo {
  nombre: string;
  precio: number;
}

const PHONE_NUMBER = "18297828831";
const MIN_AMOUNT_DOP = 50;

/**
 * Genera un mensaje de WhatsApp con los detalles del pedido.
 */
const generateWhatsAppMessage = async (
  items: AcuerdoItem[],
  userId: string,
  direccionId: string,
  total: number
): Promise<string> => {
  // Obtener datos del usuario
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { nombre: true, email: true }
  });

  // Obtener dirección
  const direccion = await prisma.direccion.findUnique({
    where: { id: direccionId },
    select: { calle: true, provincia: true, municipio: true, codigoPostal: true }
  });

  if (!usuario || !direccion) {
    throw new Error("No se pudieron obtener los datos del usuario o dirección");
  }

  // Obtener detalles de productos
  const productos = await Promise.all(
    items.map(async (item) => {
      const producto = await prisma.producto.findUnique({
        where: { id: item.id },
        select: { nombre: true, precio: true }
      }) as ProductoInfo | null;

      if (!producto) {
        return null;
      }

      return {
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
        subtotal: producto.precio * item.cantidad
      };
    })
  );

  let message = `*Nueva Solicitud de Pedido*\n`;
  message += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

  // Datos del cliente
  message += `*Cliente:* ${usuario.nombre}\n`;
  message += `*Email:* ${usuario.email}\n\n`;

  // Datos de la dirección
  message += `*Dirección de Envío:*\n`;
  message += `${direccion.calle}, ${direccion.municipio}, ${direccion.provincia}\n`;
  if (direccion.codigoPostal) {
    message += `Código Postal: ${direccion.codigoPostal}\n`;
  }

  // Lista de productos
  message += `\n*Productos:*\n`;
  productos.forEach((producto) => {
    if (producto) {
      message += `${producto.nombre} - Cantidad: ${producto.cantidad} - Precio: RD$${producto.precio.toFixed(2)} - Subtotal: RD$${producto.subtotal.toFixed(2)}\n`;
    }
  });

  // Total
  message += `\n*Total:* RD$${total.toFixed(2)}`;
  message += `\n\n*Estado:* Pendiente de confirmación`;

  const encodedMessage = message;
  return `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sesión no válida" },
        { status: 401 }
      );
    }

    const body = await req.json() as AcuerdoBody;

    // Validaciones básicas
    if (!body.items?.length) {
      return NextResponse.json(
        { error: "No hay productos en el carrito" },
        { status: 400 }
      );
    }

    if (!body.direccionId) {
      return NextResponse.json(
        { error: "No se ha seleccionado una dirección de envío" },
        { status: 400 }
      );
    }

    if (typeof body.total !== 'number' || isNaN(body.total) || body.total <= 0) {
      return NextResponse.json(
        { error: "El total del pedido es inválido" },
        { status: 400 }
      );
    }

    if (body.total < MIN_AMOUNT_DOP) {
      return NextResponse.json(
        { error: `El monto mínimo de compra es RD$${MIN_AMOUNT_DOP}.00` },
        { status: 400 }
      );
    }

    // Verificar existencias y validar productos
    const productosValidacion = await Promise.all(
      body.items.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.id },
          select: { 
            id: true, 
            existencias: true, 
            nombre: true,
            activo: true,
            precio: true 
          },
        });

        if (!producto) {
          return {
            error: true,
            mensaje: `El producto con ID ${item.id} no existe en el catálogo`,
            id: item.id,
            cantidadSolicitada: item.cantidad
          };
        }

        if (!producto.activo) {
          return {
            error: true,
            mensaje: `El producto "${producto.nombre}" no está disponible actualmente`,
            id: item.id,
            cantidadSolicitada: item.cantidad
          };
        }

        if (producto.existencias < item.cantidad) {
          return {
            error: true,
            mensaje: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.existencias}, Solicitado: ${item.cantidad}`,
            id: item.id,
            cantidadSolicitada: item.cantidad,
            existencias: producto.existencias
          };
        }

        return {
          error: false,
          producto,
          cantidadSolicitada: item.cantidad
        };
      })
    );

    // Verificar errores en productos
    const productoConError = productosValidacion.find(item => item.error);
    if (productoConError) {
      return NextResponse.json(
        {
          error: productoConError.mensaje,
          detalles: {
            productoId: productoConError.id,
            cantidadSolicitada: productoConError.cantidadSolicitada,
            existencias: 'existencias' in productoConError ? productoConError.existencias : 0
          }
        },
        { status: 400 }
      );
    }

    // Generar enlace de WhatsApp
    const whatsappUrl = await generateWhatsAppMessage(
      body.items,
      session.user.id,
      body.direccionId,
      body.total
    );

    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: "Solicitud de pedido generada. Por favor, confirme a través de WhatsApp.",
    });

  } catch (error) {
    console.error("Error en la generación del pedido:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la solicitud",
      },
      { status: 500 }
    );
  }
}
