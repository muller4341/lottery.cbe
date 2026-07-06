/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commonarea` to the `houses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netarea` to the `houses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proportionalarea` to the `houses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcity` to the `houses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalarea` to the `houses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "houses" ADD COLUMN     "commonarea" TEXT NOT NULL,
ADD COLUMN     "netarea" TEXT NOT NULL,
ADD COLUMN     "proportionalarea" TEXT NOT NULL,
ADD COLUMN     "subcity" TEXT NOT NULL,
ADD COLUMN     "totalarea" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");
