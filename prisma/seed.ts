import { PrismaClient, TipoPago, MarcaTarjeta, MarcaProducto, Role, ProvinciaRD, AgenciaEnvio } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

// Datos estáticos
const CATEGORIAS = [
  {
    nombre: 'Facial',
    descripcion: 'Productos para el cuidado facial',
    imagen: '/categorias/facial.jpg',
    slug: 'facial',
  },
  {
    nombre: 'Corporal',
    descripcion: 'Productos para el cuidado corporal',
    imagen: '/categorias/corporal.jpg',
    slug: 'corporal',
  },
  {
    nombre: 'Cabello',
    descripcion: 'Productos para el cuidado del cabello',
    imagen: '/categorias/cabello.jpg',
    slug: 'cabello',
  },
  {
    nombre: 'Maquillaje',
    descripcion: 'Productos de maquillaje',
    imagen: '/categorias/maquillaje.jpg',
    slug: 'maquillaje',
  },
  {
    nombre: 'Skincare',
    descripcion: 'Productos para el cuidado de la piel',
    imagen: '/categorias/skincare.png',
    slug: 'skincare',
  }
] as const;

// Productos por marca
const PRODUCTOS = [
  // Productos Arlin Glow
  {
    nombre: 'Crema Despigmentante',
    descripcion: 'Crema facial para manchas y despigmentación.',
    precio: 29.99,
    enOferta: true,
    precioOferta: 24.99,
    destacado: true,
    slug: 'crema-despigmentante',
    sku: 'CD001',
    marca: MarcaProducto.ARLIN_GLOW,
    existencias: 50,
    categoriaSlug: 'facial',
    imagen: '/productos/crema_despigmentante.jpeg'
  },
  // Productos L'Oréal
  {
    nombre: 'Base Líquida True Match',
    descripcion: 'Base de maquillaje que se adapta a tu tono de piel.',
    precio: 34.99,
    slug: 'base-true-match',
    sku: 'LO001',
    marca: MarcaProducto.LOREAL,
    existencias: 30,
    categoriaSlug: 'maquillaje',
    imagen: '/productos/base_true_match.jpeg'
  },
  // Productos Maybelline
  {
    nombre: 'Máscara de Pestañas Sky High',
    descripcion: 'Máscara que alarga y da volumen a tus pestañas.',
    precio: 19.99,
    destacado: true,
    slug: 'mascara-sky-high',
    sku: 'MB001',
    marca: MarcaProducto.MAYBELLINE,
    existencias: 45,
    categoriaSlug: 'maquillaje',
    imagen: '/productos/mascara_sky_high.jpeg'
  },
  // Productos MAC
  {
    nombre: 'Labial Ruby Woo',
    descripcion: 'Icónico labial rojo mate de larga duración.',
    precio: 39.99,
    slug: 'labial-ruby-woo',
    sku: 'MAC001',
    marca: MarcaProducto.MAC,
    existencias: 25,
    categoriaSlug: 'maquillaje',
    imagen: '/productos/labial_ruby_woo.jpeg'
  }
] as const;

// Usuarios del sistema
const USUARIOS = [
  {
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@cosmeticos.com',
    password: 'admin123',
    role: Role.ADMIN,
    telefono: '1234567890',
    activo: true
  },
  {
    nombre: 'Angel Steven',
    apellido: 'Tatis',
    email: 'angeltatistorres@gmail.com',
    password: 'admin1234',
    role: Role.ADMIN,
    telefono: '9876543210',
    activo: true
  }
] as const;

// Direcciones de ejemplo
const DIRECCIONES = [
  {
    calle: 'Calle Principal',
    numero: '123',
    sector: 'Los Jardines',
    municipio: 'Santiago de los Caballeros',
    provincia: ProvinciaRD.SANTIAGO,
    telefono: '8091234567',
    celular: '8291234567',
    agenciaEnvio: AgenciaEnvio.CARIBE_EXPRESS,
    sucursalAgencia: 'Sucursal Central',
    predeterminada: true,
    referencia: 'Cerca del parque central'
  },
  {
    calle: 'Avenida Duarte',
    numero: '456',
    sector: 'Ensanche Naco',
    municipio: 'Santo Domingo',
    provincia: ProvinciaRD.DISTRITO_NACIONAL,
    telefono: '8092345678',
    agenciaEnvio: AgenciaEnvio.VIMENPAQ,
    sucursalAgencia: 'Sucursal Naco',
    predeterminada: false
  }
] as const;

// Métodos de pago predeterminados
const METODOS_PAGO = [
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.VISA,
    ultimosDigitos: '4242',
    predeterminado: true
  },
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.MASTERCARD,
    ultimosDigitos: '5555'
  },
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.AMEX,
    ultimosDigitos: '3782'
  },
  {
    tipo: TipoPago.TARJETA,
    marca: MarcaTarjeta.CARNET,
    ultimosDigitos: '9424'
  },
  {
    tipo: TipoPago.OXXO
  },
  {
    tipo: TipoPago.TRANSFERENCIA
  },
  {
    tipo: TipoPago.STRIPE
  }
] as const;

// Funciones auxiliares
async function limpiarBaseDeDatos() {
  const tablasALimpiar = [
    'movimientoInventario',
    'itemPedido',
    'pedido',
    'favorito',
    'carritoItem',
    'metodoPago',
    'direccion',
    'image',
    'producto',
    'categoria',
    'user'
  ] as const;
  for (const tabla of tablasALimpiar) {
    if (tabla in prisma) {
      const model = prisma[tabla as keyof typeof prisma] as { deleteMany: () => Promise<unknown> };
      if ('deleteMany' in model) {
        await model.deleteMany();
      }
    }
  }
}

async function crearUsuarios() {
  return Promise.all(
    USUARIOS.map(async usuario => {
      const hashedPassword = await hash(usuario.password, 10);
      return prisma.user.create({
        data: {
          ...usuario,
          password: hashedPassword
        }
      });
    })
  );
}

async function crearCategorias() {
  return Promise.all(
    CATEGORIAS.map(categoria => 
      prisma.categoria.create({
        data: categoria
      })
    )
  );
}

async function crearProductos(categoriasMap: Record<string, string>) {
  return Promise.all(
    PRODUCTOS.map(({ categoriaSlug, imagen, ...producto }) => 
      prisma.producto.create({
        data: {
          ...producto,
          categoriaId: categoriasMap[categoriaSlug],
          imagenes: {
            create: {
              url: imagen,
              alt: producto.nombre,
              principal: true,
              orden: 1
            }
          }
        }
      })
    )
  );
}

async function crearMetodosPago(userId: string) {
  return Promise.all(
    METODOS_PAGO.map(metodo =>
      prisma.metodoPago.create({
        data: {
          ...metodo,
          userId
        }
      })
    )
  );
}

async function crearDirecciones(userId: string) {
  return Promise.all(
    DIRECCIONES.map(direccion =>
      prisma.direccion.create({
        data: {
          ...direccion,
          userId
        }
      })
    )
  );
}

// Función principal
async function main() {
  try {
    console.log('🧹 Limpiando base de datos...');
    await limpiarBaseDeDatos();

    console.log('👥 Creando usuarios...');
    const usuarios = await crearUsuarios();
    const adminId = usuarios[0].id;

    console.log('📍 Creando direcciones...');
    await crearDirecciones(adminId);

    console.log('📁 Creando categorías...');
    const categorias = await crearCategorias();
    const categoriasMap = categorias.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>);

    console.log('🏷️ Creando productos...');
    await crearProductos(categoriasMap);

    console.log('💳 Creando métodos de pago...');
    await crearMetodosPago(adminId);

    console.log('✅ Base de datos sembrada correctamente');
    console.log('Credenciales de acceso:');
    USUARIOS.forEach(usuario => {
      console.log(`- ${usuario.email} / ${usuario.password}`);
    });

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
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