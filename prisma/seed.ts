import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // Limpiamos las tablas existentes
    await prisma.movimientoInventario.deleteMany()
    await prisma.direccionEnvio.deleteMany()
    await prisma.pedido.deleteMany()
    await prisma.producto.deleteMany()
    await prisma.categoria.deleteMany()
    await prisma.user.deleteMany()

    // Usuario administrador
    const admin = await prisma.user.create({
        data: {
            nombre: 'Admin',
            apellido: 'Sistema',
            email: 'admin@cosmeticos.com',
            password: await hash('admin123', 10),
            role: 'ADMIN',
            telefono: '1234567890'
        }
    })

    // Categorías de cosméticos
    const categorias = await Promise.all([
        prisma.categoria.create({
            data: {
                nombre: 'Cuidado Facial',
                descripcion: 'Productos para el cuidado de la piel del rostro',
                slug: 'cuidado-facial',
                imagen: '/categorias/facial.jpg',
                activa: true
            }
        }),
        prisma.categoria.create({
            data: {
                nombre: 'Maquillaje',
                descripcion: 'Productos de maquillaje y cosméticos decorativos',
                slug: 'maquillaje',
                imagen: '/categorias/maquillaje.jpg',
                activa: true
            }
        }),
        prisma.categoria.create({
            data: {
                nombre: 'Cuidado Corporal',
                descripcion: 'Productos para el cuidado de la piel del cuerpo',
                slug: 'cuidado-corporal',
                imagen: '/categorias/corporal.jpg',
                activa: true
            }
        })
    ])

    // Productos cosméticos
    const productos = await Promise.all([
        prisma.producto.create({
            data: {
                nombre: 'Crema Hidratante Facial',
                descripcion: 'Crema hidratante con vitamina E para todo tipo de piel',
                precio: 29.99,
                imagenes: ['/productos/crema-facial-1.jpg'],
                slug: 'crema-hidratante-facial',
                sku: 'CF001',
                marca: 'NaturalCare',
                existencias: 50,
                stockMinimo: 10,
                activo: true,
                categoriaId: categorias[0].id
            }
        }),
        prisma.producto.create({
            data: {
                nombre: 'Base de Maquillaje',
                descripcion: 'Base líquida de larga duración',
                precio: 24.99,
                imagenes: ['/images/productos/base-1.jpg'],
                slug: 'base-maquillaje',
                sku: 'MQ001',
                marca: 'MakeupPro',
                existencias: 30,
                stockMinimo: 5,
                categoriaId: categorias[1].id
            }
        }),
        prisma.producto.create({
            data: {
                nombre: 'Crema Corporal',
                descripcion: 'Crema hidratante corporal con manteca de karité',
                precio: 19.99,
                imagenes: ['/images/productos/crema-corporal-1.jpg'],
                slug: 'crema-corporal',
                sku: 'CC001',
                marca: 'BodyCare',
                existencias: 40,
                stockMinimo: 8,
                categoriaId: categorias[2].id
            }
        })
    ])

    // Crear movimientos de inventario iniciales
    await Promise.all(productos.map(producto => 
        prisma.movimientoInventario.create({
            data: {
                producto: { connect: { id: producto.id } },
                tipo: 'ENTRADA',
                cantidad: producto.existencias,
                nota: 'Stock inicial',
                creadoPor: { connect: { id: admin.id } }
            }
        })
    ))

    console.log('Base de datos sembrada correctamente')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 