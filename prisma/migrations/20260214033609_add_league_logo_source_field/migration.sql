-- CreateEnum
CREATE TYPE "LogoSource" AS ENUM ('LOCAL', 'EXTERNAL');

-- AlterTable
ALTER TABLE "user_favorite_leagues" ADD COLUMN     "leagueLogoSource" "LogoSource";
