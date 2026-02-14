-- CreateEnum
CREATE TYPE "LeagueSource" AS ENUM ('THESPORTSDB', 'APIFOOTBALL', 'INTERNAL');

-- CreateTable
CREATE TABLE "user_favorite_leagues" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sport" VARCHAR(50) NOT NULL,
    "source" "LeagueSource" NOT NULL,
    "externalId" VARCHAR(50) NOT NULL,
    "leagueName" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "leagueLogo" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_favorite_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_favorite_leagues_userId_sport_idx" ON "user_favorite_leagues"("userId", "sport");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_leagues_userId_sport_source_externalId_key" ON "user_favorite_leagues"("userId", "sport", "source", "externalId");

-- AddForeignKey
ALTER TABLE "user_favorite_leagues" ADD CONSTRAINT "user_favorite_leagues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
