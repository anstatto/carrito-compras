import ProductGrid from '@/app/components/products/ProductGrid'
import FilterSidebar from '@/app/components/catalog/FilterSidebar'
import { Suspense } from 'react'
import Loading from './loading'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'


type SearchParams = {
  [key: string]: string | string[] | undefined
}

async function getData(params: SearchParams = {}) {
  const page = Number(params.pagina) || 1
  const perPage = Number(params.porPagina) || 12
  const skip = (page - 1) * perPage
  
  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(params.categoria && { categoriaId: params.categoria as string }),
    ...(params.buscar && {
      nombre: {
        contains: params.buscar as string,
        mode: Prisma.QueryMode.insensitive
      }
    })
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      skip,
      take: perPage,
      include: {
        imagenes: {
          select: {
            url: true,
            alt: true
          },
          orderBy: {
            orden: 'asc'
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true
          }
        }
      }
    }),
    prisma.producto.count({ where })
  ])

  return { productos, total }
}

export default async function CatalogoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await Promise.resolve(searchParams)
  
  const defaultParams = {
    pagina: params.pagina || '1',
    porPagina: params.porPagina || '12',
    categoria: params.categoria || undefined,
    ordenar: params.ordenar || undefined,
    precioMin: params.precioMin || undefined,
    precioMax: params.precioMax || undefined,
  }

  const { productos, total } = await getData(defaultParams)
  const categorias = await prisma.categoria.findMany({
    where: { activa: true },
    select: {
      id: true,
      nombre: true,
      slug: true
    }
  })

  const serializedProducts = productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: Number(p.precio),
    precioOferta: p.precioOferta ? Number(p.precioOferta) : null,
    categoria: {
      id: p.categoria.id,
      nombre: p.categoria.nombre,
      slug: p.categoria.slug
    },
    imagenes: p.imagenes.map(img => ({
      url: img.url,
      alt: img.alt || p.nombre
    })),
    slug: p.slug
  }))

  const serializedCategories = categorias.map(c => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar 
            categorias={serializedCategories}
            currentFilters={{
              pagina: String(defaultParams.pagina),
              porPagina: String(defaultParams.porPagina),
              categoria: defaultParams.categoria?.toString(),
              ordenar: defaultParams.ordenar?.toString(),
              precioMin: defaultParams.precioMin?.toString(), 
              precioMax: defaultParams.precioMax?.toString()
            }}
          />
        </aside>

        <main className="flex-grow">
          <Suspense fallback={<Loading />}>
            <ProductGrid 
              products={serializedProducts.map(p => ({
                ...p,
                imagenes: p.imagenes.map(img => img.url)
              }))}
              total={total}
              currentPage={parseInt(defaultParams.pagina.toString())}
              itemsPerPage={parseInt(defaultParams.porPagina.toString())}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}