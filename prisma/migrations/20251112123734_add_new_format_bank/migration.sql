/*
  Warnings:

  - You are about to drop the column `addedBalance` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `editBalance` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `gains` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `losses` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `profitAndLoss` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `BankrollHistory` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawals` on the `BankrollHistory` table. All the data in the column will be lost.
  - Added the required column `balanceAfter` to the `BankrollHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balanceBefore` to the `BankrollHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `BankrollHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."HistoryType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET_PLACED', 'BET_WON', 'BET_LOST', 'BET_VOID', 'UNID_VALUE_CHANGE', 'BALANCE_ADJUSTMENT');

-- AlterTable
ALTER TABLE "public"."Bankroll" ADD COLUMN     "totalDeposited" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalReturned" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalStaked" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalWithdrawn" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."BankrollHistory" DROP COLUMN "addedBalance",
DROP COLUMN "balance",
DROP COLUMN "editBalance",
DROP COLUMN "gains",
DROP COLUMN "losses",
DROP COLUMN "profitAndLoss",
DROP COLUMN "result",
DROP COLUMN "withdrawals",
ADD COLUMN     "actualReturn" DECIMAL(65,30),
ADD COLUMN     "amount" DECIMAL(65,30),
ADD COLUMN     "balanceAfter" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "balanceBefore" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "odds" DECIMAL(65,30),
ADD COLUMN     "potentialWin" DECIMAL(65,30),
ADD COLUMN     "stake" DECIMAL(65,30),
ADD COLUMN     "type" "public"."HistoryType" NOT NULL,
ADD COLUMN     "unidValueAfter" DECIMAL(65,30),
ADD COLUMN     "unidValueBefore" DECIMAL(65,30);

-- DropEnum
DROP TYPE "public"."EditBalance";

-- CreateIndex
CREATE INDEX "BankrollHistory_eventId_idx" ON "public"."BankrollHistory"("eventId");

-- CreateIndex
CREATE INDEX "BankrollHistory_type_date_idx" ON "public"."BankrollHistory"("type", "date");
