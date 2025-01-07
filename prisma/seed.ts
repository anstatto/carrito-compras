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

    // Crear categorías
    const categorias = await Promise.all([
        prisma.categoria.create({
            data: {
                nombre: 'Facial',
                descripcion: 'Productos para el cuidado facial',
                imagen: '/categorias/facial.jpg',
                slug: 'facial',
            }
        }),
        prisma.categoria.create({
            data: {
                nombre: 'Corporal',
                descripcion: 'Productos para el cuidado corporal',
                imagen: '/categorias/corporal.jpg',
                slug: 'corporal',
            }
        })
    ])

    // Crear productos
    const productos = await Promise.all([
        prisma.producto.create({
            data: {
                nombre: 'Crema Despigmentante',
                descripcion: 'Crema facial para manchas y despigmentación',
                precio: 29.99,
                slug: 'crema-despigmentante',
                sku: 'CD001',
                marca: 'Arlin Glow',
                existencias: 50,
                categoriaId: categorias[0].id, // Facial
                imagenes: {
                    create: [
                        {
                            url: '/productos/crema_desPigmetaNte.jpeg',
                            alt: 'Crema Despigmentante',
                            principal: true,
                            orden: 1
                        }
                    ]
                }
            }
        }),
        prisma.producto.create({
            data: {
                nombre: 'Crema Hidratante',
                descripcion: 'Crema facial hidratante',
                precio: 24.99,
                slug: 'crema-hidratante',
                sku: 'CH001',
                marca: 'Arlin Glow',
                existencias: 75,
                categoriaId: categorias[0].id, // Facial
                imagenes: {
                    create: [
                        {
                            url: '/productos/crema_hidratante.jpeg',
                            alt: 'Crema Hidratante',
                            principal: true,
                            orden: 1
                        }
                    ]
                }
            }
        }),
        prisma.producto.create({
            data: {
                nombre: 'Exfoliante de Coco y Menta',
                descripcion: 'Exfoliante corporal con coco y menta',
                precio: 19.99,
                slug: 'exfoliante-coco-menta',
                sku: 'ECM001',
                marca: 'Arlin Glow',
                existencias: 60,
                categoriaId: categorias[1].id, // Corporal
                imagenes: {
                    create: [
                        {
                            url: '/productos/Exfoliante_coco_menta.jpeg',
                            alt: 'Exfoliante de Coco y Menta',
                            principal: true,
                            orden: 1
                        }
                    ]
                }
            }
        }),
        prisma.producto.create({
            data: {
                nombre: 'Exfoliante de Fresa',
                descripcion: 'Exfoliante corporal con fresa',
                precio: 19.99,
                slug: 'exfoliante-fresa',
                sku: 'EF001',
                marca: 'Arlin Glow',
                existencias: 45,
                categoriaId: categorias[1].id, // Corporal
                imagenes: {
                    create: [
                        {
                            url: '/productos/Exfoliante_de_fresa.jpeg',
                            alt: 'Exfoliante de Fresa',
                            principal: true,
                            orden: 1
                        }
                    ]
                }
            }
        }),
        prisma.producto.create({
            data: {
                nombre: 'Aceite Capilar',
                descripcion: 'Aceite para el cuidado del cabello',
                precio: 34.99,
                slug: 'aceite-capilar',
                sku: 'AC001',
                marca: 'Arlin Glow',
                existencias: 30,
                categoriaId: categorias[1].id, // Corporal
                imagenes: {
                    create: [
                        {
                            url: '/productos/pelling_oil.jpeg',
                            alt: 'Aceite Capilar',
                            principal: true,
                            orden: 1
                        }
                    ]
                }
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