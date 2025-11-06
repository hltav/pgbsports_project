/*
  Warnings:

  - Added the required column `initialBalance` to the `Bankroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Bankroll" ADD COLUMN     "initialBalance" DECIMAL(65,30) NOT NULL;

-- CreateTable
CREATE TABLE "public"."BankrollHistory" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" DECIMAL(65,30) NOT NULL,
    "unidValue" DECIMAL(65,30) NOT NULL,
    "deposits" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "withdrawals" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "BankrollHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankrollHistory_bankrollId_date_idx" ON "public"."BankrollHistory"("bankrollId", "date");

-- AddForeignKey
ALTER TABLE "public"."BankrollHistory" ADD CONSTRAINT "BankrollHistory_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "public"."Bankroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
