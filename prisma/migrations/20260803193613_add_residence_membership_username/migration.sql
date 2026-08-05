/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'MEMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "Residence" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Residence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "residenceId" INTEGER NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Residence_code_key" ON "Residence"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_residenceId_key" ON "Membership"("userId", "residenceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Residence" ADD CONSTRAINT "Residence_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_residenceId_fkey" FOREIGN KEY ("residenceId") REFERENCES "Residence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
