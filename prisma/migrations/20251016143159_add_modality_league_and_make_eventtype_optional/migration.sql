/*
  Warnings:

  - Added the required column `league` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modality` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "league" TEXT NOT NULL,
ADD COLUMN     "modality" TEXT NOT NULL,
ALTER COLUMN "eventType" DROP NOT NULL;
