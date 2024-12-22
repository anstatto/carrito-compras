import ProductGrid from '@/app/components/products/ProductGrid'
import FilterSidebar from '@/app/components/catalog/FilterSidebar'
import CatalogHeader from '@/app/components/catalog/CatalogHeader'
import { prisma } from '@/lib/prisma'

import { Suspense } from 'react'


// Función para obtener los productos con filtros
async function getProducts(searchParams: {
  categoria?: string
  precioMin?: string
  precioMax?: string
  ordenar?: string
  pagina?: string
  porPagina?: string
}) {
  const {
    categoria,
    precioMin,
    precioMax,
    ordenar = 'nombre_asc',
    pagina = '1',
    porPagina = '12'
  } = searchParams

  const where = {
    ...(categoria && { categoriaId: categoria }),
    ...(precioMin && { precio: { gte: parseFloat(precioMin) } }),
    ...(precioMax && { precio: { lte: parseFloat(precioMax) } }),
  }

  const [orderField, orderDirection] = ordenar.split('_')
  
  const productos = await prisma.producto.findMany({
    where,
    include: {
      categoria: true,
    },
    orderBy: {
      [orderField]: orderDirection,
    },
    skip: (parseInt(pagina) - 1) * parseInt(porPagina),
    take: parseInt(porPagina),
  })

  const total = await prisma.producto.count({ where })

  return { productos, total }
}

// Función para obtener las categorías
async function getCategorias() {
  return await prisma.categoria.findMany()
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const { productos, total } = await getProducts(searchParams)
  const categorias = await getCategorias()
  const currentPage = parseInt(searchParams.pagina || '1')
  const itemsPerPage = parseInt(searchParams.porPagina || '12')

  return (
    <div className="container mx-auto px-4 py-8">
      <CatalogHeader total={total} />
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar 
            categorias={categorias}
            currentFilters={searchParams}
          />
        </aside>
        <main className="flex-grow">
          <Suspense fallback={<div>Cargando...</div>}>
            <ProductGrid 
              products={productos}
              total={total}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}