-- AlterTable
ALTER TABLE "snapshots_daily" ADD COLUMN     "cumulativeUnits" DECIMAL(12,4);

-- AlterTable
ALTER TABLE "snapshots_hourly" ADD COLUMN     "cumulativeUnits" DECIMAL(12,4);

-- AlterTable
ALTER TABLE "snapshots_monthly" ADD COLUMN     "cumulativeUnits" DECIMAL(12,4);

-- AlterTable
ALTER TABLE "snapshots_weekly" ADD COLUMN     "cumulativeUnits" DECIMAL(12,4);

-- AlterTable
ALTER TABLE "snapshots_yearly" ADD COLUMN     "cumulativeUnits" DECIMAL(12,4);
