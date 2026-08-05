/*
  Warnings:

  - You are about to drop the column `personId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `residenceId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueInCents` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('ALIMENTACAO', 'DOMESTICAS', 'ASSINATURAS', 'LAZER', 'OUTROS');

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_personId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_userId_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "personId",
DROP COLUMN "value",
ADD COLUMN     "category" "ExpenseCategory" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "residenceId" INTEGER NOT NULL,
ADD COLUMN     "valueInCents" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Person";

-- CreateTable
CREATE TABLE "MonthClosure" (
    "id" SERIAL NOT NULL,
    "residenceId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "closedById" INTEGER NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthClosure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthClosure_residenceId_year_month_key" ON "MonthClosure"("residenceId", "year", "month");

-- CreateIndex
CREATE INDEX "Expense_residenceId_year_month_idx" ON "Expense"("residenceId", "year", "month");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "Residence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthClosure" ADD CONSTRAINT "MonthClosure_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "Residence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthClosure" ADD CONSTRAINT "MonthClosure_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
