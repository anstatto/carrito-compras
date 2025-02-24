import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import { Suspense } from "react";
import Loading from "./loading";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import { ProductView } from "@/interfaces/Product";


async function getData(categoriaSlug: string) {
  // Obtén el ID de la categoría usando el slug
  const categoria = await prisma.categoria.findUnique({
    where: { slug: categoriaSlug },
    select: { id: true },
  });

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    categoriaId: categoria?.id, // Filtra por la categoría
  };

  const productos = await prisma.producto.findMany({
    where,
    include: {
      imagenes: {
        select: {
          url: true,
          alt: true,
        },
        orderBy: {
          orden: "asc",
        },
      },
      categoria: {
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      },
    },
  });

  const total = await prisma.producto.count({ where });

  return { productos, total };
}

export default async function CatalogoPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const { productos, total } = await getData(slug);

  const categorias = await prisma.categoria.findMany({
    where: { activa: true },
    select: {
      id: true,
      nombre: true,
      slug: true,
      _count: {
        select: {
          productos: {
            where: { activo: true },
          },
        },
      },
    },
  });

  const serializedProducts = productos.map(
    (p) =>
      ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        precioOferta: p.precioOferta ? Number(p.precioOferta) : null,
        destacado: p.destacado,
        enOferta: p.enOferta,
        categoria: p.categoria,
        imagenes: p.imagenes,
        slug: p.slug,
        existencias: p.existencias,
        marca: p.marca,
      }) satisfies ProductView
  );

  const serializedCategories = categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    productCount: c._count.productos,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar
            categorias={serializedCategories}
            currentFilters={{ categoria: slug }}
          />
        </aside>

        <main className="flex-grow">
          <CatalogHeader total={total} currentSort="creadoEl_desc" />

          <Suspense fallback={<Loading />}>
            <ProductGrid
              products={serializedProducts}
              total={total}
              currentPage={1}
              itemsPerPage={productos.length}
              currentSort="creadoEl_desc"
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
