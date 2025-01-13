import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const pedidos = await prisma.pedido.findMany({
      where: {
        clienteId: session.user.id
      },
      select: {
        id: true,
        numero: true,
        creadoEl: true,
        estado: true,
        estadoPago: true,
        total: true,
        items: {
          include: {
            producto: {
              include: {
                imagenes: {
                  select: {
                    url: true
                  },
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: {
        creadoEl: 'desc'
      }
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json(
      { error: "Error al obtener los pedidos" },
      { status: 500 }
    );
  }
} 