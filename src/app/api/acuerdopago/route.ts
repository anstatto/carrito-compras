// File: /app/api/acuerdopago/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AcuerdoItem {
  id: string;
  cantidad: number;
  precio: number;
  nombre: string;
  marca: string;
}

interface AcuerdoBody {
  items: AcuerdoItem[];
  direccionId: string;
  total: number;
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
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { nombre: true, email: true, telefono: true }
  });

  const direccion = await prisma.direccion.findUnique({
    where: { id: direccionId },
    select: { 
      calle: true, 
      numero: true,
      sector: true,
      provincia: true, 
      municipio: true, 
      codigoPostal: true,
      agenciaEnvio: true,
      sucursalAgencia: true
    }
  });

  if (!usuario || !direccion) {
    throw new Error("No se pudieron obtener los datos del usuario o dirección");
  }

  let message = `*Nueva Solicitud de Pedido*\n`;
  message += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

  // Datos del cliente
  message += `*Cliente:* ${usuario.nombre}\n`;
  message += `*Email:* ${usuario.email}\n`;
  if (usuario.telefono) {
    message += `*Teléfono:* ${usuario.telefono}\n`;
  }
  message += '\n';

  // Datos de la dirección
  message += `*Dirección de Envío:*\n`;
  message += `${direccion.calle} ${direccion.numero}\n`;
  message += `${direccion.sector}, ${direccion.municipio}\n`;
  message += `${direccion.provincia.replace(/_/g, ' ')}\n`;
  if (direccion.codigoPostal) {
    message += `Código Postal: ${direccion.codigoPostal}\n`;
  }
  if (direccion.agenciaEnvio) {
    message += `Agencia: ${direccion.agenciaEnvio.replace(/_/g, ' ')}\n`;
    if (direccion.sucursalAgencia) {
      message += `Sucursal: ${direccion.sucursalAgencia}\n`;
    }
  }

  // Lista de productos
  message += `\n*Productos:*\n`;
  for (const item of items) {
    message += `• ${item.nombre}\n`;
    message += `  Cantidad: ${item.cantidad}\n`;
    message += `  Precio: RD$${item.precio.toFixed(2)}\n`;
    message += `  Subtotal: RD$${(item.precio * item.cantidad).toFixed(2)}\n\n`;
  }

  // Total
  message += `\n*Total del Pedido:* RD$${total.toFixed(2)}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para realizar un pedido" },
        { status: 401 }
      );
    }

    const body = await req.json() as AcuerdoBody;

    // Validaciones básicas
    if (!body.direccionId) {
      return NextResponse.json(
        { error: "Por favor, selecciona una dirección de envío" },
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

    // Verificar existencias
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
            mensaje: `El producto no está disponible`,
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
            mensaje: `Solo quedan ${producto.existencias} unidades disponibles de "${producto.nombre}"`,
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
      message: "¡Pedido generado! Te redirigiremos a WhatsApp para confirmarlo.",
    });

  } catch (error) {
    console.error("Error al generar el pedido:", error);
    return NextResponse.json(
      {
        error: "Hubo un problema al procesar tu pedido. Por favor, intenta nuevamente.",
      },
      { status: 500 }
    );
  }
}
