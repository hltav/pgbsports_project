/*
  Warnings:

  - Added the required column `unidValue` to the `Bankroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bankroll" ADD COLUMN     "unidValue" DOUBLE PRECISION NOT NULL;
