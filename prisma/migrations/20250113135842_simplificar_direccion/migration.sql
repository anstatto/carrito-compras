/*
  Warnings:

  - You are about to drop the column `numero_ext` on the `direcciones` table. All the data in the column will be lost.
  - You are about to drop the column `numero_int` on the `direcciones` table. All the data in the column will be lost.
  - You are about to alter the column `calle` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `telefono` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `celular` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `codigo_postal` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `municipio` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `referencia` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `sector` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `sucursal_agencia` on the `direcciones` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `numero` to the `direcciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "direcciones" DROP COLUMN "numero_ext",
DROP COLUMN "numero_int",
ADD COLUMN     "numero" VARCHAR(20) NOT NULL,
ALTER COLUMN "calle" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "telefono" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "celular" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "codigo_postal" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "municipio" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "referencia" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "sector" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "sucursal_agencia" SET DATA TYPE VARCHAR(100);
