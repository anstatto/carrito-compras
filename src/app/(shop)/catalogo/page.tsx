import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import { Suspense } from "react";
import Loading from "./loading";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import { ProductView } from "@/interfaces/Product";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

async function getData(params: SearchParams = {}) {
  const page = Number(params.pagina) || 1;
  const perPage = Number(params.porPagina) || 12;
  const skip = (page - 1) * perPage;

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(params.categoria && { categoriaId: params.categoria as string }),
    ...(params.enOferta === "true" && {
      enOferta: true,
      precioOferta: {
        not: null,
        gt: 0,
      },
    }),
    ...((params.precioMin || params.precioMax) && {
      AND: [
        params.precioMin
          ? {
              precio: { gte: new Prisma.Decimal(params.precioMin as string) },
            }
          : {},
        params.precioMax
          ? {
              precio: { lte: new Prisma.Decimal(params.precioMax as string) },
            }
          : {},
      ].filter(Boolean),
    }),
  };

  let orderBy: Prisma.ProductoOrderByWithRelationInput = {
    creadoEl: "desc",
  };

  switch (params.ordenar) {
    case "precio_asc":
      orderBy = { precio: "asc" };
      break;
    case "precio_desc":
      orderBy = { precio: "desc" };
      break;
    case "nombre_asc":
      orderBy = { nombre: "asc" };
      break;
    case "nombre_desc":
      orderBy = { nombre: "desc" };
      break;
    case "ofertas":
      orderBy = {
        enOferta: "desc",
        precioOferta: "asc",
      };
      break;
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
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
    }),
    prisma.producto.count({ where }),
  ]);

  return { productos, total };
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const defaultParams = {
    pagina: params.pagina?.toString() || "1",
    porPagina: params.porPagina?.toString() || "12",
    categoria: params.categoria?.toString(),
    ordenar: params.ordenar?.toString() || "creadoEl_desc",
    precioMin: params.precioMin?.toString(),
    precioMax: params.precioMax?.toString(),
    enOferta: params.enOferta?.toString(),
  };

  const { productos, total } = await getData(defaultParams);
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
            currentFilters={defaultParams}
          />
        </aside>

        <main className="flex-grow">
          <CatalogHeader total={total} currentSort={defaultParams.ordenar} />

          <Suspense fallback={<Loading />}>
            <ProductGrid
              products={serializedProducts}
              total={total}
              currentPage={parseInt(defaultParams.pagina)}
              itemsPerPage={parseInt(defaultParams.porPagina)}
              currentSort={defaultParams.ordenar}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
