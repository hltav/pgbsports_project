/*
  Warnings:

  - You are about to drop the column `deposits` on the `BankrollHistory` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."EditBalance" AS ENUM ('addedBalance', 'withdrawals');

-- AlterTable
ALTER TABLE "public"."BankrollHistory" DROP COLUMN "deposits",
ADD COLUMN     "addedBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "editBalance" "public"."EditBalance",
ADD COLUMN     "gains" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "losses" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "profitAndLoss" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "result" DECIMAL(65,30) NOT NULL DEFAULT 0;
