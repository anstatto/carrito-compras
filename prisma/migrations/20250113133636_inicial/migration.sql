/*
  Warnings:

  - You are about to drop the column `productoId` on the `carrito_items` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `carrito_items` table. All the data in the column will be lost.
  - You are about to drop the column `ciudad` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `codigoPostal` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `colonia` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `numeroExt` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `numeroInt` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `direcciones` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,producto_id]` on the table `carrito_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `precio_unitario` to the `carrito_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `producto_id` to the `carrito_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `carrito_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `carrito_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipio` to the `direcciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_ext` to the `direcciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `direcciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `direcciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `direcciones` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProvinciaRD" AS ENUM ('AZUA', 'BAHORUCO', 'BARAHONA', 'DAJABON', 'DISTRITO_NACIONAL', 'DUARTE', 'EL_SEIBO', 'ELIAS_PINA', 'ESPAILLAT', 'HATO_MAYOR', 'HERMANAS_MIRABAL', 'INDEPENDENCIA', 'LA_ALTAGRACIA', 'LA_ROMANA', 'LA_VEGA', 'MARIA_TRINIDAD_SANCHEZ', 'MONSENOR_NOUEL', 'MONTE_CRISTI', 'MONTE_PLATA', 'PEDERNALES', 'PERAVIA', 'PUERTO_PLATA', 'SAMANA', 'SAN_CRISTOBAL', 'SAN_JOSE_DE_OCOA', 'SAN_JUAN', 'SAN_PEDRO_DE_MACORIS', 'SANCHEZ_RAMIREZ', 'SANTIAGO', 'SANTIAGO_RODRIGUEZ', 'SANTO_DOMINGO', 'VALVERDE');

-- CreateEnum
CREATE TYPE "AgenciaEnvio" AS ENUM ('VIMENPAQ', 'CARIBE_EXPRESS', 'CARIBE_TOURS', 'DOMINICANA_CARGO', 'ENVIOS_BOYCA', 'PACK_EXPRESS', 'SERVI_CARGO', 'OTRO');

-- DropForeignKey
ALTER TABLE "carrito_items" DROP CONSTRAINT "carrito_items_productoId_fkey";

-- DropForeignKey
ALTER TABLE "carrito_items" DROP CONSTRAINT "carrito_items_userId_fkey";

-- DropForeignKey
ALTER TABLE "direcciones" DROP CONSTRAINT "direcciones_userId_fkey";

-- DropIndex
DROP INDEX "carrito_items_productoId_idx";

-- DropIndex
DROP INDEX "carrito_items_userId_idx";

-- DropIndex
DROP INDEX "carrito_items_userId_productoId_key";

-- DropIndex
DROP INDEX "direcciones_userId_idx";

-- DropIndex
DROP INDEX "usuarios_email_activo_idx";

-- AlterTable
ALTER TABLE "carrito_items" DROP COLUMN "productoId",
DROP COLUMN "userId",
ADD COLUMN     "precio_unitario" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "producto_id" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "cantidad" SET DEFAULT 1,
ALTER COLUMN "actualizado_el" DROP DEFAULT;

-- AlterTable
ALTER TABLE "direcciones" DROP COLUMN "ciudad",
DROP COLUMN "codigoPostal",
DROP COLUMN "colonia",
DROP COLUMN "estado",
DROP COLUMN "numeroExt",
DROP COLUMN "numeroInt",
DROP COLUMN "userId",
ADD COLUMN     "agencia_envio" "AgenciaEnvio",
ADD COLUMN     "celular" TEXT,
ADD COLUMN     "codigo_postal" TEXT,
ADD COLUMN     "municipio" TEXT NOT NULL,
ADD COLUMN     "numero_ext" TEXT NOT NULL,
ADD COLUMN     "numero_int" TEXT,
ADD COLUMN     "provincia" "ProvinciaRD" NOT NULL,
ADD COLUMN     "referencia" TEXT,
ADD COLUMN     "sector" TEXT NOT NULL,
ADD COLUMN     "sucursal_agencia" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "limite_por_compra" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "carrito_actualizado" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "carrito_items_user_id_idx" ON "carrito_items"("user_id");

-- CreateIndex
CREATE INDEX "carrito_items_producto_id_idx" ON "carrito_items"("producto_id");

-- CreateIndex
CREATE INDEX "carrito_items_creado_el_idx" ON "carrito_items"("creado_el");

-- CreateIndex
CREATE UNIQUE INDEX "carrito_items_user_id_producto_id_key" ON "carrito_items"("user_id", "producto_id");

-- CreateIndex
CREATE INDEX "direcciones_user_id_idx" ON "direcciones"("user_id");

-- CreateIndex
CREATE INDEX "direcciones_predeterminada_idx" ON "direcciones"("predeterminada");

-- CreateIndex
CREATE INDEX "productos_existencias_idx" ON "productos"("existencias");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_activo_idx" ON "usuarios"("activo");

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
