import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const products = await prisma.producto.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
        activo: true,
        existencias: {
          gt: 0
        }
      },
      select: {
        id: true,
        nombre: true,
        precio: true,
        existencias: true,
        enOferta: true,
        precioOferta: true,
        imagenes: {
          select: {
            url: true
          },
          take: 1
        }
      },
      take: 5,
      orderBy: {
        nombre: 'asc'
      }
    });

    // Procesar URLs de imágenes
    const processedProducts = products.map(product => ({
      ...product,
      imagenes: product.imagenes.map(img => ({
        url: `/productos/${img.url.split("/").pop()}`
      }))
    }));

    return NextResponse.json(processedProducts);
  } catch (error) {
    console.error("Error en búsqueda de productos:", error);
    return NextResponse.json(
      { error: "Error al buscar productos" },
      { status: 500 }
    );
  }
} 