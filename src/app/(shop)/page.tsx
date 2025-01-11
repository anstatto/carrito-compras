import { prisma } from '@/lib/prisma'
import { ProductView } from '@/interfaces/Product'
import HeroSection from '@/app/components/home/HeroSection'
import FeaturedProducts from '@/app/components/products/FeaturedProducts'
import CategoriesSection from '@/app/components/home/CategoriesSection'
import TestimonialsSection from '@/app/components/home/TestimonialsSection'
import WhatsAppButton from '../components/home/WhatsAppButton'

// Obtener productos destacados del servidor
async function getFeaturedProducts() {
  try {
    const products = await prisma.producto.findMany({
      where: {
        AND: [
          { activo: true },
          { destacado: true },
          { existencias: { gt: 0 } },
          {
            OR: [
              { enOferta: false },
              {
                enOferta: true,
                precioOferta: { not: null, gt: 0 }
              }
            ]
          }
        ]
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            slug: true
          }
        },
        imagenes: {
          where: { 
            OR: [
              { principal: true },
              { orden: 0 }
            ]
          },
          select: {
            url: true,
            alt: true
          },
          orderBy: {
            orden: 'asc'
          },
          take: 1
        }
      },
      orderBy: [
        { enOferta: 'desc' },
        { creadoEl: 'desc' }
      ],
      take: 8
    })

    return products.map(product => ({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: Number(product.precio),
      precioOferta: product.precioOferta ? Number(product.precioOferta) : null,
      enOferta: product.enOferta,
      imagenes: product.imagenes,
      slug: product.slug,
      categoria: product.categoria,
      marca: product.marca,
      existencias: product.existencias
    } satisfies ProductView))
  } catch (error) {
    console.error('Error al cargar productos destacados:', error)
    return []
  }
}

export const metadata = {
  title: 'Arlin Glow Care - Productos de Belleza y Cuidado Personal',
  description: 'Descubre nuestra exclusiva colección de productos para el cuidado de tu belleza. Productos naturales y de alta calidad.',
  keywords: ['belleza', 'cuidado personal', 'productos naturales', 'cosmética'],
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background-pink)] via-white to-[var(--background-pink)]">
      {/* Hero Section con animaciones y diseño mejorado */}
      <HeroSection />

      {/* Productos Destacados con efectos de hover y animaciones */}
      {featuredProducts.length > 0 && (
        <FeaturedProducts products={featuredProducts} />
      )}

      {/* Categorías con diseño atractivo y animaciones */}
      <CategoriesSection />

      {/* Testimonios con efectos de parallax y animaciones */}
      <TestimonialsSection />

      {/* WhatsApp Button con animación de entrada y hover */}
      <WhatsAppButton />
    </div>
  )
}