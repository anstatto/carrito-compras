import { PrismaClient, TipoPago, MarcaTarjeta } from "@prisma/client";
import bcrypt from "bcryptjs";

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

const METODOS_PAGO = [
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.VISA,
    ultimosDigitos: "4242",
    predeterminado: true,
  },
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.MASTERCARD,
    ultimosDigitos: "5555",
  },
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.AMEX,
    ultimosDigitos: "3782",
  },
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.CARNET,
    ultimosDigitos: "9424",
  },
  {
    tipo: TipoPago.EFECTIVO,
  },
  {
    tipo: TipoPago.TRANSFERENCIA,
  },
  {
    tipo: TipoPago.STRIPE,
  },
];

async function main() {
  // Eliminar datos existentes
  await prisma.metodoPago.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.user.deleteMany();

  // Crear categorías
  for (const categoria of CATEGORIAS) {
    await prisma.categoria.create({
      data: categoria,
    });
  }

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      nombre: "Admin",
      apellido: "Sistema",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
      activo: true,
    },
  });

  // Crear métodos de pago para el admin
  for (const metodo of METODOS_PAGO) {
    await prisma.metodoPago.create({
      data: {
        ...metodo,
        userId: admin.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
