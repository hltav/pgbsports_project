/*
  Warnings:

  - The `result` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,name]` on the table `Bankroll` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `eventType` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SINGLE', 'MULTIPLE', 'LIVE');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('pending', 'win', 'lose', 'void');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEST_USER';

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_clientDataId_fkey";

-- DropForeignKey
ALTER TABLE "Bankroll" DROP CONSTRAINT "Bankroll_userId_fkey";

-- DropForeignKey
ALTER TABLE "ClientData" DROP CONSTRAINT "ClientData_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_bankId_fkey";

-- DropIndex
DROP INDEX "Bankroll_name_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "eventType",
ADD COLUMN     "eventType" "EventType" NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" "Result" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "Bankroll_userId_name_key" ON "Bankroll"("userId", "name");

-- CreateIndex
CREATE INDEX "Event_userId_eventType_idx" ON "Event"("userId", "eventType");

-- AddForeignKey
ALTER TABLE "ClientData" ADD CONSTRAINT "ClientData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_clientDataId_fkey" FOREIGN KEY ("clientDataId") REFERENCES "ClientData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bankroll" ADD CONSTRAINT "Bankroll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bankroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
