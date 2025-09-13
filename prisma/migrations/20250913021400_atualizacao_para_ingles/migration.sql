/*
  Warnings:

  - You are about to drop the column `ano` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `mes` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Pessoa` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `month` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Pessoa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Gasto" DROP COLUMN "ano",
DROP COLUMN "mes",
DROP COLUMN "nome",
DROP COLUMN "valor",
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Pessoa" DROP COLUMN "nome",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "nome",
DROP COLUMN "senha",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;
