/*
  Warnings:

  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[searchableEmailHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `searchableEmailHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "searchableEmailHash" VARCHAR(64) NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "User_searchableEmailHash_key" ON "public"."User"("searchableEmailHash");
