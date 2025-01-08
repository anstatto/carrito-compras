/*
  Warnings:

  - You are about to drop the column `impuestos` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `productos` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `Pedido` table. All the data in the column will be lost.
  - You are about to alter the column `total` on the `Pedido` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `metodoPago` column on the `Pedido` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `DireccionEnvio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DireccionEnvio" DROP CONSTRAINT "DireccionEnvio_pedidoId_fkey";

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "impuestos",
DROP COLUMN "productos",
DROP COLUMN "subtotal",
ADD COLUMN     "direccion" TEXT,
ALTER COLUMN "total" SET DEFAULT 0,
ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "metodoPago",
ADD COLUMN     "metodoPago" TEXT;

-- DropTable
DROP TABLE "DireccionEnvio";

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnit" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "creadoEl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemPedido_pedidoId_idx" ON "ItemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedido_productoId_idx" ON "ItemPedido"("productoId");

-- CreateIndex
CREATE INDEX "Pedido_clienteId_estado_idx" ON "Pedido"("clienteId", "estado");

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
