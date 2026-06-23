/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Applicant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `House` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lottery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LotteryResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Site` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "HouseStatus" AS ENUM ('NONE', 'PROVIDED');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('NONE', 'WINNER', 'WAITLIST');

-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_siteId_fkey";

-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_siteId_fkey";

-- DropForeignKey
ALTER TABLE "Lottery" DROP CONSTRAINT "Lottery_siteId_fkey";

-- DropForeignKey
ALTER TABLE "LotteryResult" DROP CONSTRAINT "LotteryResult_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "LotteryResult" DROP CONSTRAINT "LotteryResult_houseId_fkey";

-- DropForeignKey
ALTER TABLE "LotteryResult" DROP CONSTRAINT "LotteryResult_lotteryId_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Applicant";

-- DropTable
DROP TABLE "House";

-- DropTable
DROP TABLE "Lottery";

-- DropTable
DROP TABLE "LotteryResult";

-- DropTable
DROP TABLE "Site";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "houses" (
    "id" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "block" TEXT,
    "floor" INTEGER NOT NULL,
    "site" TEXT NOT NULL,
    "bedroom" INTEGER,
    "area" TEXT NOT NULL,
    "status" "HouseStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "idCode" TEXT,
    "username" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "bedroom" INTEGER NOT NULL DEFAULT 0,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lottery_results" (
    "id" TEXT NOT NULL,
    "lotteryRunId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "bedroom" INTEGER NOT NULL,
    "floor" INTEGER,
    "houseNumber" TEXT,
    "status" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "houseId" TEXT,
    "applicantId" TEXT NOT NULL,

    CONSTRAINT "lottery_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "houses_site_area_bedroom_idx" ON "houses"("site", "area", "bedroom");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_idCode_key" ON "applicants"("idCode");

-- CreateIndex
CREATE INDEX "applicants_site_area_bedroom_idx" ON "applicants"("site", "area", "bedroom");

-- AddForeignKey
ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "houses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lottery_results" ADD CONSTRAINT "lottery_results_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
