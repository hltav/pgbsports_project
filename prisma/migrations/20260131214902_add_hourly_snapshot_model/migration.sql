-- CreateTable
CREATE TABLE "snapshots_hourly" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "unidValue" DECIMAL(15,2) NOT NULL,
    "hourlyProfit" DECIMAL(15,2) NOT NULL,
    "hourlyROI" DECIMAL(10,4) NOT NULL,
    "unitsChange" DECIMAL(10,2) NOT NULL,
    "peakBalance" DECIMAL(15,2) NOT NULL,
    "maxDrawdown" DECIMAL(15,2) NOT NULL,
    "hourlyDrawdown" DECIMAL(15,2) NOT NULL,
    "drawdownPercent" DECIMAL(5,2) NOT NULL,
    "betsPlaced" INTEGER NOT NULL DEFAULT 0,
    "betsWon" INTEGER NOT NULL DEFAULT 0,
    "betsLost" INTEGER NOT NULL DEFAULT 0,
    "winRate" DECIMAL(6,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snapshots_hourly_bankrollId_bucketStart_idx" ON "snapshots_hourly"("bankrollId", "bucketStart" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_hourly_bankrollId_bucketStart_key" ON "snapshots_hourly"("bankrollId", "bucketStart");

-- AddForeignKey
ALTER TABLE "snapshots_hourly" ADD CONSTRAINT "snapshots_hourly_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
