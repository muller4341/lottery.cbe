-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "blockNumber" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "bedType" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "isAllocated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "fullName" TEXT,
    "siteId" INTEGER NOT NULL,
    "bedType" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lottery" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "bedType" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION NOT NULL,
    "totalHouses" INTEGER NOT NULL,
    "totalApplicants" INTEGER NOT NULL,
    "winnersCount" INTEGER NOT NULL,
    "waitlistCount" INTEGER NOT NULL,
    "drawnById" INTEGER NOT NULL,
    "drawnAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotteryResult" (
    "id" SERIAL NOT NULL,
    "lotteryId" INTEGER NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "houseId" INTEGER,
    "status" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");

-- CreateIndex
CREATE INDEX "House_siteId_bedType_totalArea_idx" ON "House"("siteId", "bedType", "totalArea");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_employeeId_key" ON "Applicant"("employeeId");

-- CreateIndex
CREATE INDEX "Applicant_siteId_bedType_totalArea_idx" ON "Applicant"("siteId", "bedType", "totalArea");

-- CreateIndex
CREATE INDEX "Lottery_drawnAt_idx" ON "Lottery"("drawnAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lottery_siteId_bedType_totalArea_key" ON "Lottery"("siteId", "bedType", "totalArea");

-- CreateIndex
CREATE INDEX "LotteryResult_lotteryId_status_idx" ON "LotteryResult"("lotteryId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LotteryResult_lotteryId_applicantId_key" ON "LotteryResult"("lotteryId", "applicantId");

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryResult" ADD CONSTRAINT "LotteryResult_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryResult" ADD CONSTRAINT "LotteryResult_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryResult" ADD CONSTRAINT "LotteryResult_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;
