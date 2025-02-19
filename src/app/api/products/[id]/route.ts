import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { ProductFormData } from '@/interfaces/Product'


type Params = { id: string };

interface ProductImage {
  url: string;
  alt?: string | null;
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    // Asegurarnos que tenemos el id
    const {id} = await params;
    if (!id) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        marca: true,
        existencias: true,
        stockMinimo: true,
        slug: true,
        sku: true,
        activo: true,
        enOferta: true,
        precioOferta: true,
        destacado: true,
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
        imagenes: {
          orderBy: { orden: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            principal: true,
            orden: true,
          },
        },
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Procesar URLs de imágenes
    const processedProduct = {
      ...producto,
      imagenes: producto.imagenes.map((img) => ({
        ...img,
        url: `/productos/${img.url.split("/").pop()}`,
      })),
    };

    return NextResponse.json(processedProduct);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    // 1. Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    // 2. Obtener y validar datos
    const {id} = await params;
    const requestData = await request.json() as ProductFormData

    // 3. Actualizar producto base
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Actualizar producto principal
      const producto = await tx.producto.update({
        where: {
          id: id,
        },
        data: {
          nombre: requestData.nombre,
          descripcion: requestData.descripcion,
          precio: new Prisma.Decimal(requestData.precio),
          existencias: requestData.existencias,
          stockMinimo: requestData.stockMinimo,
          categoriaId: requestData.categoriaId,
          activo: requestData.activo,
          enOferta: requestData.enOferta,
          precioOferta: requestData.precioOferta
            ? new Prisma.Decimal(requestData.precioOferta)
            : null,
          destacado: requestData.destacado,
          actualizadoEl: new Date(),
        },
      });

      // Actualizar imágenes si existen
      if (requestData.imagenes?.length > 0) {
        await tx.image.deleteMany({
          where: { productoId: id },
        });

        await tx.image.createMany({
          data: requestData.imagenes.map((img, index) => ({
            url: img.url,
            alt: img.alt || producto.nombre,
            principal: index === 0,
            orden: index,
            productoId: id,
          })),
        });
      }

      // Retornar producto actualizado con relaciones
      return tx.producto.findUnique({
        where: { id: id },
        include: {
          categoria: true,
          imagenes: true,
        },
      });
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct
    })

  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al actualizar producto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<Params>}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    const  { id } = await params;
    // Primero eliminar imágenes relacionadas
    await prisma.image.deleteMany({
      where: { productoId: id}
    })

    // Luego eliminar el producto
    await prisma.producto.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const {id} = await params;
    const data = await request.json()

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        ...data,
        actualizadoEl: new Date()
      },
      include: {
        categoria: true,
        imagenes: true
      }
    })

    return NextResponse.json({
      success: true,
      data: producto
    })

  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al actualizar producto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    const data = await request.json()
    
    // Validar datos requeridos
    if (!data.nombre || !data.precio || !data.categoriaId) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos'
      }, { status: 400 })
    }

    const product = await prisma.$transaction(async (tx) => {
      // Crear el producto
      const newProduct = await tx.producto.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: new Prisma.Decimal(data.precio),
          existencias: data.existencias,
          stockMinimo: data.stockMinimo,
          categoriaId: data.categoriaId,
          activo: data.activo,
          enOferta: data.enOferta,
          precioOferta: data.precioOferta 
            ? new Prisma.Decimal(data.precioOferta) 
            : null,
          destacado: data.destacado,
          slug: data.slug || data.nombre.toLowerCase().replace(/ /g, '-'),
          sku: data.sku || `SKU-${Date.now()}`,
          marca: data.marca || 'GENERICO',
          categoria: {
            connect: { id: data.categoriaId }
          }
        }
      })

      // Crear imágenes si existen
      if (data.imagenes?.length > 0) {
        await tx.image.createMany({
          data: data.imagenes.map((img: ProductImage, index: number) => ({
            url: img.url,
            alt: img.alt || newProduct.nombre,
            principal: index === 0,
            orden: index,
            productoId: newProduct.id
          }))
        })
      }

      // Retornar producto con relaciones
      return tx.producto.findUnique({
        where: { id: newProduct.id },
        include: {
          categoria: true,
          imagenes: true
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: product
    })

  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al crear el producto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}