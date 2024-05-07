/*
  Warnings:

  - You are about to drop the column `lastUpdatedAt` on the `Library` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LibraryType` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `typeName` to the `LibraryType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Library" DROP COLUMN "lastUpdatedAt",
ADD COLUMN     "establishedAt" INTEGER DEFAULT 1900,
ADD COLUMN     "recordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LibraryType" DROP COLUMN "name",
ADD COLUMN     "typeName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "recordCreatedAt" DATE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
