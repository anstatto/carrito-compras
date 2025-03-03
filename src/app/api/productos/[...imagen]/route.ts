import { NextResponse } from 'next/server'

import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ imagen: string[] }> }) {
  try {
    const { imagen } = await params;

    // Lógica para obtener la imagen del producto
    const producto = await prisma.producto.findUnique({
      where: { id: imagen[0] },
      include: {
        imagenes: true,
        // ... otras relaciones
      },
    });

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 