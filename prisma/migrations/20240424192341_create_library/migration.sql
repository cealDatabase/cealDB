-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "LibraryType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LibraryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryRegion" (
    "id" SERIAL NOT NULL,
    "regionName" TEXT NOT NULL,

    CONSTRAINT "LibraryRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "shortLanName" TEXT NOT NULL,
    "longLanName" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Library" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isLawLibrary" BOOLEAN NOT NULL DEFAULT false,
    "isMedLibrary" BOOLEAN NOT NULL DEFAULT false,
    "bibliographic" TEXT[],
    "consortia" TEXT[],
    "systemVendor" TEXT[],
    "opac" BOOLEAN,
    "libHomePage" TEXT,
    "onlineCatalogPage" TEXT,
    "libraryNumber" INTEGER NOT NULL,
    "regionId" INTEGER,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "positionTitle" TEXT,
    "workPhone" TEXT,
    "faxNumber" TEXT,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" DATE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "LibraryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "LibraryRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE SET NULL ON UPDATE CASCADE;
