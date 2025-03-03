/*
  Warnings:

  - The values [OXXO] on the enum `TipoPago` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoPago_new" AS ENUM ('TARJETA', 'EFECTIVO', 'TRANSFERENCIA', 'STRIPE');
ALTER TABLE "metodos_pago" ALTER COLUMN "tipo" TYPE "TipoPago_new" USING ("tipo"::text::"TipoPago_new");
ALTER TYPE "TipoPago" RENAME TO "TipoPago_old";
ALTER TYPE "TipoPago_new" RENAME TO "TipoPago";
DROP TYPE "TipoPago_old";
COMMIT;
