-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "marketCategory" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "marketSub" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "optionMarket" TEXT NOT NULL DEFAULT '';
