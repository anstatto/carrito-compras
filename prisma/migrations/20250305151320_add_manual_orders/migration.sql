-- DropForeignKey
ALTER TABLE "direcciones" DROP CONSTRAINT "direcciones_user_id_fkey";

-- DropForeignKey
ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_clienteId_fkey";

-- AlterTable
ALTER TABLE "direcciones" ADD COLUMN     "es_manual" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "email_cliente" TEXT,
ADD COLUMN     "es_manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombre_cliente" TEXT,
ADD COLUMN     "telefono_cliente" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "direcciones_es_manual_idx" ON "direcciones"("es_manual");

-- CreateIndex
CREATE INDEX "pedidos_es_manual_idx" ON "pedidos"("es_manual");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
