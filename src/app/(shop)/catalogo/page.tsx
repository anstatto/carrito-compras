import ProductGrid from '@/app/components/products/ProductGrid'
import FilterSidebar from '@/app/components/catalog/FilterSidebar'
import CatalogHeader from '@/app/components/catalog/CatalogHeader'
import { Suspense } from 'react'
import Loading from './loading'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

async function getData(params: SearchParams) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const searchParams = new URLSearchParams()
    
    // Agregar parámetros válidos
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.set(key, value.toString())
      })
    }

    // Realizar peticiones
    const [catalogoRes, categoriasRes] = await Promise.all([
      fetch(`${baseUrl}/api/catalogo?${searchParams}`, {
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/categorias`, {
        cache: 'no-store'
      })
    ])

    if (!catalogoRes.ok || !categoriasRes.ok) {
      throw new Error('Error al cargar datos')
    }

    const [catalogoData, categorias] = await Promise.all([
      catalogoRes.json(),
      categoriasRes.json()
    ])

    return {
      productos: catalogoData.productos,
      total: catalogoData.total,
      categorias
    }

  } catch (error) {
    console.error('Error:', error)
    return {
      productos: [],
      total: 0,
      categorias: []
    }
  }
}

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Asegúrate de esperar searchParams
  const params = await searchParams;

  // Definir valores por defecto sin usar Object.fromEntries
  const defaultParams = {
    categoria: params?.categoria?.toString(),
    precioMin: params?.precioMin?.toString(),
    precioMax: params?.precioMax?.toString(),
    ordenar: params?.ordenar?.toString() || 'nombre_asc',
    pagina: params?.pagina?.toString() || '1',
    porPagina: params?.porPagina?.toString() || '12'
  };

  const { productos, total, categorias } = await getData(defaultParams)

  return (
    <div className="container mx-auto px-4 py-8">
      <CatalogHeader total={total} />
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar 
            categorias={categorias}
            currentFilters={defaultParams}
          />
        </aside>

        <main className="flex-grow">
          <Suspense fallback={<Loading />}>
            <ProductGrid 
              products={productos}
              total={total}
              currentPage={parseInt(defaultParams.pagina)}
              itemsPerPage={parseInt(defaultParams.porPagina)}
            />
          </Suspense>
        </main>
      </div>
    </div>
  )
}