/*
  Warnings:

  - You are about to drop the column `category` on the `Event` table. All the data in the column will be lost.
  - Added the required column `odd` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "category",
ADD COLUMN     "odd" DECIMAL(65,30) NOT NULL;
