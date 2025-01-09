'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { FaFilter, FaPercent } from 'react-icons/fa'
import { motion } from 'framer-motion'

type CatalogHeaderProps = {
  total: number
  showMobileFilters?: () => void
  currentSort?: string
}

export default function CatalogHeader({ 
  total, 
  showMobileFilters,
  currentSort = 'creadoEl_desc'
}: CatalogHeaderProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('ordenar', value)
    params.delete('pagina')
    router.push(`/catalogo?${params.toString()}`, { scroll: false })
  }

  const toggleOffers = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('enOferta')) {
      params.delete('enOferta')
    } else {
      params.set('enOferta', 'true')
    }
    params.delete('pagina')
    router.push(`/catalogo?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {showMobileFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={showMobileFilters}
            className="md:hidden p-2 rounded-lg bg-gray-100"
          >
            <FaFilter className="w-5 h-5" />
          </motion.button>
        )}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Catálogo de Productos
        </motion.h1>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOffers}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all
            ${searchParams.get('enOferta') 
              ? 'bg-pink-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <FaPercent />
          <span>Ofertas</span>
        </motion.button>

        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600"
        >
          {total} productos
        </motion.span>
        
        <select
          className="px-4 py-2 rounded-full border border-gray-200 
                     bg-white text-gray-900 focus:ring-2 focus:ring-pink-500 outline-none"
          onChange={(e) => handleSort(e.target.value)}
          value={currentSort}
        >
          <option value="nombre_asc">Nombre A-Z</option>
          <option value="nombre_desc">Nombre Z-A</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
          <option value="ofertas">Ofertas primero</option>
          <option value="creadoEl_desc">Más nuevos</option>
        </select>
      </div>
    </div>
  )
} 