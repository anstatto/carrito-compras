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

    console.log('Productos encontrados:', JSON.stringify(products, null, 2));

    // Si las URLs no son completas, las corregimos
    const productsWithFullUrls = products.map(product => ({
      ...product,
      imagenes: product.imagenes.map(img => ({
        url: img.url.startsWith('http') 
          ? img.url 
          : `https://res.cloudinary.com/dwga2dsbz/image/upload/${img.url}`
      }))
    }));

    console.log('Productos procesados:', JSON.stringify(productsWithFullUrls, null, 2));

    return NextResponse.json(productsWithFullUrls);
  } catch (error) {
    console.error("Error en búsqueda de productos:", error);
    return NextResponse.json(
      { error: "Error al buscar productos" },
      { status: 500 }
    );
  }
} 