/*
  Warnings:

  - A unique constraint covering the columns `[houseNumber]` on the table `houses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "houses_houseNumber_key" ON "houses"("houseNumber");
