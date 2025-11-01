/*
  Warnings:

  - You are about to drop the column `eventType` on the `Event` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Event_userId_eventType_idx";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "eventType";

-- DropEnum
DROP TYPE "public"."EventType";
