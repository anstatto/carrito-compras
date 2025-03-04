-- AlterTable
ALTER TABLE "items_pedido" ADD COLUMN     "en_oferta" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "porcentaje_descuento" INTEGER,
ADD COLUMN     "precio_oferta" DECIMAL(10,2),
ADD COLUMN     "precio_regular" DECIMAL(10,2);
