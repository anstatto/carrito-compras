import { PrismaClient, TipoPago, MarcaTarjeta } from "@prisma/client";

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
    tipo: TipoPago.OXXO,
  },
  {
    tipo: TipoPago.TRANSFERENCIA,
  },
  {
    tipo: TipoPago.STRIPE,
  },
];

async function main() {
  // Crear categorías
  for (const categoria of CATEGORIAS) {
    await prisma.categoria.create({
      data: categoria,
    });
  }

  const userId = "cm7c8t95j0000jr03l22vsn9j"; // Reemplaza con el ID de tu usuario

  for (const metodo of METODOS_PAGO) {
    await prisma.metodoPago.create({
      data: {
        ...metodo,
        userId: userId,
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
