import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIAS = [
  {
    nombre: "Facial",
    descripcion: "Productos para el cuidado facial",
    imagen: "/categorias/facial.jpg",
    slug: "facial",
  },
  {
    nombre: "Corporal",
    descripcion: "Productos para el cuidado corporal",
    imagen: "/categorias/corporal.jpg",
    slug: "corporal",
  },
  {
    nombre: "Cabello",
    descripcion: "Productos para el cuidado del cabello",
    imagen: "/categorias/cabello.jpg",
    slug: "cabello",
  },
  {
    nombre: "Maquillaje",
    descripcion: "Productos de maquillaje",
    imagen: "/categorias/maquillaje.jpg",
    slug: "maquillaje",
  },
  {
    nombre: "Skincare",
    descripcion: "Productos para el cuidado de la piel",
    imagen: "/categorias/skincare.png",
    slug: "skincare",
  },
];



async function main() {
  console.log('🌱 Iniciando seed...');
  
  // Crear categorías
  console.log('📁 Creando categorías...');
  for (const categoria of CATEGORIAS) {
    await prisma.categoria.upsert({
      where: { slug: categoria.slug },
      update: categoria,
      create: categoria,
    });
  }
  console.log('✅ Categorías creadas');

  console.log('🌱 Seed completado');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
