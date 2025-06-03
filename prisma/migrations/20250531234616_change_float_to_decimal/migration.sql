/*
  Warnings:

  - You are about to alter the column `balance` on the `Bankroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `unidValue` on the `Bankroll` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Bankroll" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "unidValue" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);
