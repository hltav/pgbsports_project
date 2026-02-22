-- AlterTable
ALTER TABLE "bankroll_histories" ADD COLUMN     "adminId" INTEGER,
ADD COLUMN     "ipAddress" VARCHAR(45);

-- CreateIndex
CREATE INDEX "bankroll_histories_adminId_idx" ON "bankroll_histories"("adminId");
