import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductContent from "@/components/products/ProductContent";
import Loading from "./loading";
import Link from "next/link";
import { ProductView } from "@/interfaces/Product";
import { Metadata } from "next";

type Params = Promise<{ id: string }>;

// Función para obtener el producto
async function getProductById(id: string): Promise<ProductView | null> {
  try {
    const producto = await prisma.producto.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        activo: true,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        imagenes: {
          select: {
            url: true,
            alt: true,
            orden: true,
          },
          orderBy: {
            orden: "asc",
          },
        },
      },
    });

    if (!producto) return null;

    // Serializar el producto
    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: Number(producto.precio),
      precioOferta: producto.precioOferta
        ? Number(producto.precioOferta)
        : null,
      enOferta: producto.enOferta,
      destacado: producto.destacado,
      marca: producto.marca,
      imagenes: producto.imagenes.map((img) => ({
        url: img.url,
        alt: img.alt || producto.nombre,
      })),
      slug: producto.slug || "default-slug",
      categoria: {
        id: producto.categoria.id,
        nombre: producto.categoria.nombre,
        slug: producto.categoria.slug,
      },
      existencias: producto.existencias,
    };
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return null;
  }
}

// Generar metadatos
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const producto = await getProductById(id);

  if (!producto) {
    return {
      title: "Producto no encontrado",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${producto.nombre} - Arlin Glow Care`,
    description:
      producto.descripcion || "Detalles del producto en Arlin Glow Care",
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion,
      images: producto.imagenes[0]?.url ? [producto.imagenes[0].url] : [],
    },
  };
}

// Generar rutas estáticas
export async function generateStaticParams() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { id: true, slug: true },
  });

  return productos.map((producto) => ({
    id: producto.slug,
  }));
}

// Página del producto
export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const producto = await getProductById(id);

  if (!producto) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <Suspense fallback={<Loading />}>
        <div className="max-w-7xl mx-auto">
          <nav className="mb-4 text-sm breadcrumbs">
            <ul className="flex items-center space-x-2 text-gray-500">
              <li>
                <Link href="/productos">Productos</Link>
              </li>
              <li>•</li>
              <li>
                <Link href={`/productos/categoria/${producto.categoria.slug}`}>
                  {producto.categoria.nombre}
                </Link>
              </li>
              <li>•</li>
              <li className="text-gray-900 font-medium">{producto.nombre}</li>
            </ul>
          </nav>
          <ProductContent producto={producto} />
        </div>
      </Suspense>
    </main>
  );
}
