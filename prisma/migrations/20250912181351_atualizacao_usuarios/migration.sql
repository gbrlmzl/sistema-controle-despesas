/*
  Warnings:

  - The primary key for the `Gasto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idGasto` on the `Gasto` table. All the data in the column will be lost.
  - The primary key for the `Pessoa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idPessoa` on the `Pessoa` table. All the data in the column will be lost.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idUsuario` on the `Usuario` table. All the data in the column will be lost.
  - The required column `id` was added to the `Gasto` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `id` to the `Pessoa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Gasto" DROP CONSTRAINT "Gasto_idPessoa_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pessoa" DROP CONSTRAINT "Pessoa_idUsuario_fkey";

-- AlterTable
ALTER TABLE "public"."Gasto" DROP CONSTRAINT "Gasto_pkey",
DROP COLUMN "idGasto",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Pessoa" DROP CONSTRAINT "Pessoa_pkey",
DROP COLUMN "idPessoa",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "idUsuario",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "senha" TEXT NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."Pessoa" ADD CONSTRAINT "Pessoa_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_idPessoa_fkey" FOREIGN KEY ("idPessoa") REFERENCES "public"."Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
