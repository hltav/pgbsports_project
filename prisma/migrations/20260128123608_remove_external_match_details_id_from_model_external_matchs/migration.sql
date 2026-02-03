/*
  Warnings:

  - You are about to drop the column `externalMatchDetailsId` on the `external_matches` table. All the data in the column will be lost.
  - The `playerId` column on the `match_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assistId` column on the `match_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[externalMatchId,eventHash]` on the table `match_events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventHash` to the `match_events` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `teamId` on the `match_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `teamId` on the `match_lineups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `teamId` on the `match_statistics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `playerId` on the `player_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `teamId` on the `player_match_stats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "external_matches_externalMatchDetailsId_key";

-- AlterTable
ALTER TABLE "external_matches" DROP COLUMN "externalMatchDetailsId";

-- AlterTable
ALTER TABLE "match_events" ADD COLUMN     "eventHash" VARCHAR(64) NOT NULL,
DROP COLUMN "teamId",
ADD COLUMN     "teamId" INTEGER NOT NULL,
DROP COLUMN "playerId",
ADD COLUMN     "playerId" INTEGER,
DROP COLUMN "assistId",
ADD COLUMN     "assistId" INTEGER;

-- AlterTable
ALTER TABLE "match_lineups" DROP COLUMN "teamId",
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "match_statistics" DROP COLUMN "teamId",
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "player_match_stats" DROP COLUMN "playerId",
ADD COLUMN     "playerId" INTEGER NOT NULL,
DROP COLUMN "teamId",
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "match_events_externalMatchId_teamId_minute_idx" ON "match_events"("externalMatchId", "teamId", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "match_events_externalMatchId_eventHash_key" ON "match_events"("externalMatchId", "eventHash");

-- CreateIndex
CREATE UNIQUE INDEX "match_lineups_externalMatchId_teamId_key" ON "match_lineups"("externalMatchId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "match_statistics_externalMatchId_teamId_period_key" ON "match_statistics"("externalMatchId", "teamId", "period");

-- CreateIndex
CREATE INDEX "player_match_stats_playerId_idx" ON "player_match_stats"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "player_match_stats_externalMatchId_playerId_key" ON "player_match_stats"("externalMatchId", "playerId");
