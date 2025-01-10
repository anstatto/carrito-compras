-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PROCESANDO', 'PAGADO', 'FALLIDO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('TARJETA', 'OXXO', 'TRANSFERENCIA', 'STRIPE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MarcaTarjeta" AS ENUM ('VISA', 'MASTERCARD', 'AMEX', 'CARNET');

-- CreateEnum
CREATE TYPE "MarcaProducto" AS ENUM ('ARLIN_GLOW', 'LOREAL', 'MAYBELLINE', 'MAC', 'NIVEA', 'NEUTROGENA', 'OTRO');

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "slug" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "marca" "MarcaProducto" NOT NULL,
    "existencias" INTEGER NOT NULL,
    "stock_minimo" INTEGER NOT NULL DEFAULT 5,
    "en_oferta" BOOLEAN NOT NULL DEFAULT false,
    "precio_oferta" DECIMAL(10,2),
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "categoria_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "producto_id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "nota" TEXT,
    "userId" TEXT NOT NULL,
    "creadoEl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "impuestos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "costoEnvio" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodo_pago_id" TEXT,
    "direccion_id" TEXT NOT NULL,
    "stripe_payment_intent_id" TEXT,
    "notas" TEXT,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_pedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnit" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL,
    "stripe_customer_id" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrito_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrito_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calle" TEXT NOT NULL,
    "numeroExt" TEXT NOT NULL,
    "numeroInt" TEXT,
    "colonia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "predeterminada" BOOLEAN NOT NULL DEFAULT false,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "ultimos_digitos" TEXT,
    "marca" TEXT,
    "predeterminado" BOOLEAN NOT NULL DEFAULT false,
    "stripe_payment_method_id" TEXT,
    "creado_el" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_el" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_slug_idx" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_activa_idx" ON "categorias"("activa");

-- CreateIndex
CREATE INDEX "categorias_nombre_idx" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_slug_key" ON "productos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE INDEX "productos_categoria_id_idx" ON "productos"("categoria_id");

-- CreateIndex
CREATE INDEX "productos_slug_idx" ON "productos"("slug");

-- CreateIndex
CREATE INDEX "productos_sku_idx" ON "productos"("sku");

-- CreateIndex
CREATE INDEX "productos_en_oferta_idx" ON "productos"("en_oferta");

-- CreateIndex
CREATE INDEX "productos_precio_idx" ON "productos"("precio");

-- CreateIndex
CREATE INDEX "productos_precio_oferta_idx" ON "productos"("precio_oferta");

-- CreateIndex
CREATE INDEX "productos_destacado_idx" ON "productos"("destacado");

-- CreateIndex
CREATE INDEX "productos_activo_en_oferta_idx" ON "productos"("activo", "en_oferta");

-- CreateIndex
CREATE INDEX "productos_categoria_id_activo_idx" ON "productos"("categoria_id", "activo");

-- CreateIndex
CREATE INDEX "imagenes_producto_id_idx" ON "imagenes"("producto_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_productoId_idx" ON "movimientos_inventario"("productoId");

-- CreateIndex
CREATE INDEX "movimientos_inventario_userId_idx" ON "movimientos_inventario"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_stripe_payment_intent_id_key" ON "pedidos"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");

-- CreateIndex
CREATE INDEX "pedidos_estado_idx" ON "pedidos"("estado");

-- CreateIndex
CREATE INDEX "pedidos_estado_pago_idx" ON "pedidos"("estado_pago");

-- CreateIndex
CREATE INDEX "pedidos_creado_el_idx" ON "pedidos"("creado_el");

-- CreateIndex
CREATE INDEX "pedidos_numero_idx" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "items_pedido_pedidoId_idx" ON "items_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX "items_pedido_productoId_idx" ON "items_pedido"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_stripe_customer_id_key" ON "usuarios"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "usuarios_email_activo_idx" ON "usuarios"("email", "activo");

-- CreateIndex
CREATE INDEX "carrito_items_userId_idx" ON "carrito_items"("userId");

-- CreateIndex
CREATE INDEX "carrito_items_productoId_idx" ON "carrito_items"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "carrito_items_userId_productoId_key" ON "carrito_items"("userId", "productoId");

-- CreateIndex
CREATE INDEX "favoritos_userId_idx" ON "favoritos"("userId");

-- CreateIndex
CREATE INDEX "favoritos_productoId_idx" ON "favoritos"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "favoritos_userId_productoId_key" ON "favoritos"("userId", "productoId");

-- CreateIndex
CREATE INDEX "direcciones_userId_idx" ON "direcciones"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_stripe_payment_method_id_key" ON "metodos_pago"("stripe_payment_method_id");

-- CreateIndex
CREATE INDEX "metodos_pago_userId_idx" ON "metodos_pago"("userId");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodos_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_direccion_id_fkey" FOREIGN KEY ("direccion_id") REFERENCES "direcciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_pedido" ADD CONSTRAINT "items_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_pedido" ADD CONSTRAINT "items_pedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago" ADD CONSTRAINT "metodos_pago_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
