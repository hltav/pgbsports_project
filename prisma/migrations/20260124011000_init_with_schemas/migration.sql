-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TEST_USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "bet_type" AS ENUM ('SINGLE', 'MULTIPLE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'STAKE', 'BET_PLACED', 'BET_WIN', 'BET_LOSS', 'BET_VOID', 'BET_CASHOUT', 'UNID_VALUE_CHANGE', 'BALANCE_ADJUSTMENT', 'BET_BONUS', 'TRANSFER');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('pending', 'win', 'lose', 'draw', 'cashout', 'returned', 'void', 'half_win', 'half_lose');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED', 'ABANDONED', 'HALF_TIME', 'NOT_STARTED', 'FIRST_HALF', 'SECOND_HALF');

-- CreateEnum
CREATE TYPE "EmailVerificationType" AS ENUM ('EMAIL_CONFIRMATION', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('DRAWDOWN', 'PROFIT_TARGET', 'LOSS_LIMIT', 'STREAK', 'ROI_DROP');

-- CreateEnum
CREATE TYPE "StatPeriod" AS ENUM ('FULL_TIME', 'FIRST_HALF', 'SECOND_HALF');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GOAL', 'CARD', 'SUBSTITUTION', 'VAR', 'PENALTY', 'OWN_GOAL');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "searchableEmailHash" VARCHAR(64) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerifiedAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_data" (
    "id" SERIAL NOT NULL,
    "gender" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "direction" TEXT,
    "houseNumber" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "clientDataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankrolls" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "unidValue" DECIMAL(15,2) NOT NULL,
    "initialBalance" DECIMAL(15,2) NOT NULL,
    "totalDeposited" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalWithdrawn" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalStaked" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalReturned" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "bookmaker" VARCHAR(100) NOT NULL DEFAULT 'Unknown',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "bankrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankroll_histories" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "type" "OperationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balanceBefore" DECIMAL(15,2) NOT NULL,
    "balanceAfter" DECIMAL(15,2) NOT NULL,
    "unidValueBefore" DECIMAL(15,2) NOT NULL,
    "unidValueAfter" DECIMAL(15,2) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "betId" INTEGER,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bankroll_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "type" "OperationType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" VARCHAR(255),
    "relatedBankrollId" INTEGER,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankroll_streaks" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "length" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "totalProfit" DECIMAL(15,2) NOT NULL,
    "totalROI" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bankroll_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankroll_records" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bankroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankroll_goals" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "targetProfit" DECIMAL(15,2) NOT NULL,
    "currentValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "period" VARCHAR(20),
    "deadline" TIMESTAMP(3),
    "achievedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bankroll_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots_daily" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "unidValue" DECIMAL(15,2) NOT NULL,
    "dailyProfit" DECIMAL(15,2) NOT NULL,
    "dailyROI" DECIMAL(10,4) NOT NULL,
    "unitsChange" DECIMAL(10,2) NOT NULL,
    "peakBalance" DECIMAL(15,2) NOT NULL,
    "maxDrawdown" DECIMAL(15,2) NOT NULL,
    "dailyDrawdown" DECIMAL(15,2) NOT NULL,
    "drawdownPercent" DECIMAL(5,2) NOT NULL,
    "betsPlaced" INTEGER NOT NULL DEFAULT 0,
    "betsWon" INTEGER NOT NULL DEFAULT 0,
    "betsLost" INTEGER NOT NULL DEFAULT 0,
    "winRate" DECIMAL(6,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots_weekly" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "unidValue" DECIMAL(15,2) NOT NULL,
    "weeklyProfit" DECIMAL(15,2) NOT NULL,
    "weeklyROI" DECIMAL(10,4) NOT NULL,
    "unitsChange" DECIMAL(10,2) NOT NULL,
    "peakBalance" DECIMAL(15,2) NOT NULL,
    "maxDrawdown" DECIMAL(15,2) NOT NULL,
    "drawdownPercent" DECIMAL(5,2) NOT NULL,
    "betsPlaced" INTEGER NOT NULL DEFAULT 0,
    "betsWon" INTEGER NOT NULL DEFAULT 0,
    "betsLost" INTEGER NOT NULL DEFAULT 0,
    "winRate" DECIMAL(6,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_weekly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots_monthly" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "unidValue" DECIMAL(15,2) NOT NULL,
    "monthlyProfit" DECIMAL(15,2) NOT NULL,
    "monthlyROI" DECIMAL(10,4) NOT NULL,
    "unitsChange" DECIMAL(10,2) NOT NULL,
    "peakBalance" DECIMAL(15,2) NOT NULL,
    "maxDrawdown" DECIMAL(15,2) NOT NULL,
    "drawdownPercent" DECIMAL(5,2) NOT NULL,
    "betsPlaced" INTEGER NOT NULL DEFAULT 0,
    "betsWon" INTEGER NOT NULL DEFAULT 0,
    "betsLost" INTEGER NOT NULL DEFAULT 0,
    "winRate" DECIMAL(6,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_monthly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots_yearly" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL,
    "unidValue" DECIMAL(15,2) NOT NULL,
    "yearlyProfit" DECIMAL(15,2) NOT NULL,
    "yearlyROI" DECIMAL(10,4) NOT NULL,
    "unitsChange" DECIMAL(10,2) NOT NULL,
    "peakBalance" DECIMAL(15,2) NOT NULL,
    "maxDrawdown" DECIMAL(15,2) NOT NULL,
    "drawdownPercent" DECIMAL(5,2) NOT NULL,
    "betsPlaced" INTEGER NOT NULL DEFAULT 0,
    "betsWon" INTEGER NOT NULL DEFAULT 0,
    "betsLost" INTEGER NOT NULL DEFAULT 0,
    "winRate" DECIMAL(6,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_yearly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bankroll_alerts" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "type" "AlertType" NOT NULL,
    "threshold" DECIMAL(15,4) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bankroll_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" SERIAL NOT NULL,
    "bankrollId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "externalMatchId" INTEGER NOT NULL,
    "apiSportsEventId" VARCHAR(50),
    "tsdbEventId" VARCHAR(50),
    "sport" VARCHAR(50) NOT NULL,
    "league" VARCHAR(100) NOT NULL,
    "eventDescription" VARCHAR(255) NOT NULL,
    "eventDate" TIMESTAMP(3),
    "homeTeam" VARCHAR(100),
    "awayTeam" VARCHAR(100),
    "homeTeamBadge" VARCHAR(255),
    "awayTeamBadge" VARCHAR(255),
    "leagueBadge" VARCHAR(255),
    "market" VARCHAR(100) NOT NULL,
    "marketCategory" VARCHAR(100) NOT NULL,
    "marketSub" VARCHAR(100),
    "selection" VARCHAR(100) NOT NULL,
    "odd" DECIMAL(10,2) NOT NULL,
    "stake" DECIMAL(15,2) NOT NULL,
    "potentialReturn" DECIMAL(15,2) NOT NULL,
    "actualReturn" DECIMAL(15,2),
    "bankrollBalance" DECIMAL(15,2) NOT NULL,
    "unitValue" DECIMAL(15,2) NOT NULL,
    "stakeInUnits" DECIMAL(10,2) NOT NULL,
    "result" "Result" NOT NULL DEFAULT 'pending',
    "profit" DECIMAL(15,2),
    "roi" DECIMAL(10,4),
    "isWin" BOOLEAN,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "confidence" SMALLINT,
    "expectedValue" DECIMAL(10,4),
    "betType" "bet_type" NOT NULL DEFAULT 'SINGLE',
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_matches" (
    "id" SERIAL NOT NULL,
    "apiSportsEventId" VARCHAR(50) NOT NULL,
    "tsdbEventId" VARCHAR(50),
    "apiSource" VARCHAR(50) NOT NULL DEFAULT 'thesportsdb',
    "externalMatchDetailsId" INTEGER,
    "sport" VARCHAR(50) NOT NULL,
    "league" VARCHAR(100) NOT NULL,
    "leagueBadge" VARCHAR(255),
    "leagueId" VARCHAR(50),
    "season" VARCHAR(20),
    "round" SMALLINT,
    "country" VARCHAR(100),
    "homeTeam" VARCHAR(100) NOT NULL,
    "awayTeam" VARCHAR(100) NOT NULL,
    "homeTeamBadge" VARCHAR(255),
    "awayTeamBadge" VARCHAR(255),
    "homeScoreHT" INTEGER,
    "awayScoreHT" INTEGER,
    "homeScoreFT" INTEGER,
    "awayScoreFT" INTEGER,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventDateLocal" TIMESTAMP(3),
    "timezone" VARCHAR(50),
    "isPostponed" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" VARCHAR(255),
    "venue" VARCHAR(200),
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncAttempts" SMALLINT NOT NULL DEFAULT 0,
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_match_details" (
    "id" SERIAL NOT NULL,
    "externalMatchId" INTEGER NOT NULL,
    "referee" VARCHAR(100),
    "venueId" INTEGER,
    "venueName" VARCHAR(200),
    "venueCity" VARCHAR(100),
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeWinner" BOOLEAN,
    "awayWinner" BOOLEAN,
    "fixtureTimestamp" BIGINT NOT NULL,
    "periodsFirst" BIGINT,
    "periodsSecond" BIGINT,
    "statusLong" VARCHAR(50),
    "statusShort" VARCHAR(20),
    "statusElapsed" INTEGER,
    "statusExtra" INTEGER,
    "events" JSONB,
    "lineups" JSONB,
    "players" JSONB,
    "statisticsTotal" JSONB,
    "statisticsFirstHalf" JSONB,
    "statisticsSecondHalf" JSONB,
    "lastApiSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataHash" VARCHAR(100),
    "rawApiResponse" JSONB,

    CONSTRAINT "external_match_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_statistics" (
    "id" SERIAL NOT NULL,
    "externalMatchId" INTEGER NOT NULL,
    "teamId" VARCHAR(50) NOT NULL,
    "teamName" VARCHAR(100) NOT NULL,
    "period" "StatPeriod" NOT NULL DEFAULT 'FULL_TIME',
    "shotsTotal" INTEGER,
    "shotsOnGoal" INTEGER,
    "shotsOffGoal" INTEGER,
    "shotsBlocked" INTEGER,
    "shotsInsideBox" INTEGER,
    "shotsOutsideBox" INTEGER,
    "possession" INTEGER,
    "passesTotal" INTEGER,
    "passesAccurate" INTEGER,
    "passesPercentage" INTEGER,
    "corners" INTEGER,
    "offsides" INTEGER,
    "fouls" INTEGER,
    "yellowCards" INTEGER,
    "redCards" INTEGER,
    "goalkeeperSaves" INTEGER,
    "expectedGoals" DECIMAL(5,2),
    "goalsPrevented" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" SERIAL NOT NULL,
    "externalMatchId" INTEGER NOT NULL,
    "teamId" VARCHAR(50) NOT NULL,
    "teamName" VARCHAR(100) NOT NULL,
    "minute" INTEGER NOT NULL,
    "extraMinute" INTEGER,
    "eventType" "EventType" NOT NULL,
    "detail" VARCHAR(100),
    "playerId" VARCHAR(50),
    "playerName" VARCHAR(100),
    "assistId" VARCHAR(50),
    "assistName" VARCHAR(100),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_lineups" (
    "id" SERIAL NOT NULL,
    "externalMatchId" INTEGER NOT NULL,
    "teamId" VARCHAR(50) NOT NULL,
    "teamName" VARCHAR(100) NOT NULL,
    "formation" VARCHAR(10),
    "coachId" VARCHAR(50),
    "coachName" VARCHAR(100),
    "coachPhoto" VARCHAR(255),
    "startingXI" JSONB NOT NULL,
    "substitutes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_match_stats" (
    "id" SERIAL NOT NULL,
    "externalMatchId" INTEGER NOT NULL,
    "playerId" VARCHAR(50) NOT NULL,
    "playerName" VARCHAR(100) NOT NULL,
    "playerPhoto" VARCHAR(255),
    "teamId" VARCHAR(50) NOT NULL,
    "position" VARCHAR(10),
    "number" INTEGER,
    "minutesPlayed" INTEGER,
    "rating" DECIMAL(3,1),
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,
    "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
    "goals" INTEGER,
    "assists" INTEGER,
    "shotsTotal" INTEGER,
    "shotsOnGoal" INTEGER,
    "passesTotal" INTEGER,
    "passesAccurate" INTEGER,
    "passesKey" INTEGER,
    "tackles" INTEGER,
    "blocks" INTEGER,
    "interceptions" INTEGER,
    "duelsTotal" INTEGER,
    "duelsWon" INTEGER,
    "dribblesAttempts" INTEGER,
    "dribblesSuccess" INTEGER,
    "dribblesPast" INTEGER,
    "foulsDrawn" INTEGER,
    "foulsCommitted" INTEGER,
    "yellowCards" INTEGER,
    "redCards" INTEGER,
    "saves" INTEGER,
    "goalsConceded" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_match_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "EmailVerificationType" NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_searchableEmailHash_key" ON "users"("searchableEmailHash");

-- CreateIndex
CREATE UNIQUE INDEX "client_data_cpf_key" ON "client_data"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "client_data_userId_key" ON "client_data"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_clientDataId_key" ON "addresses"("clientDataId");

-- CreateIndex
CREATE INDEX "bankrolls_userId_isActive_idx" ON "bankrolls"("userId", "isActive");

-- CreateIndex
CREATE INDEX "bankrolls_bookmaker_idx" ON "bankrolls"("bookmaker");

-- CreateIndex
CREATE UNIQUE INDEX "bankrolls_userId_name_key" ON "bankrolls"("userId", "name");

-- CreateIndex
CREATE INDEX "bankroll_histories_bankrollId_date_idx" ON "bankroll_histories"("bankrollId", "date" DESC);

-- CreateIndex
CREATE INDEX "bankroll_histories_bankrollId_type_date_idx" ON "bankroll_histories"("bankrollId", "type", "date" DESC);

-- CreateIndex
CREATE INDEX "bankroll_histories_betId_idx" ON "bankroll_histories"("betId");

-- CreateIndex
CREATE INDEX "operations_bankrollId_date_idx" ON "operations"("bankrollId", "date" DESC);

-- CreateIndex
CREATE INDEX "operations_bankrollId_type_idx" ON "operations"("bankrollId", "type");

-- CreateIndex
CREATE INDEX "bankroll_streaks_bankrollId_type_idx" ON "bankroll_streaks"("bankrollId", "type");

-- CreateIndex
CREATE INDEX "bankroll_streaks_bankrollId_length_idx" ON "bankroll_streaks"("bankrollId", "length" DESC);

-- CreateIndex
CREATE INDEX "bankroll_records_bankrollId_type_idx" ON "bankroll_records"("bankrollId", "type");

-- CreateIndex
CREATE INDEX "bankroll_records_bankrollId_value_idx" ON "bankroll_records"("bankrollId", "value" DESC);

-- CreateIndex
CREATE INDEX "bankroll_goals_bankrollId_isActive_idx" ON "bankroll_goals"("bankrollId", "isActive");

-- CreateIndex
CREATE INDEX "bankroll_goals_bankrollId_deadline_idx" ON "bankroll_goals"("bankrollId", "deadline");

-- CreateIndex
CREATE INDEX "snapshots_daily_bankrollId_year_month_day_idx" ON "snapshots_daily"("bankrollId", "year", "month", "day" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_daily_bankrollId_year_month_day_key" ON "snapshots_daily"("bankrollId", "year", "month", "day");

-- CreateIndex
CREATE INDEX "snapshots_weekly_bankrollId_year_week_idx" ON "snapshots_weekly"("bankrollId", "year", "week" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_weekly_bankrollId_year_week_key" ON "snapshots_weekly"("bankrollId", "year", "week");

-- CreateIndex
CREATE INDEX "snapshots_monthly_bankrollId_year_month_idx" ON "snapshots_monthly"("bankrollId", "year", "month" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_monthly_bankrollId_year_month_key" ON "snapshots_monthly"("bankrollId", "year", "month");

-- CreateIndex
CREATE INDEX "snapshots_yearly_bankrollId_year_idx" ON "snapshots_yearly"("bankrollId", "year" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_yearly_bankrollId_year_key" ON "snapshots_yearly"("bankrollId", "year");

-- CreateIndex
CREATE INDEX "bankroll_alerts_bankrollId_type_idx" ON "bankroll_alerts"("bankrollId", "type");

-- CreateIndex
CREATE INDEX "bankroll_alerts_bankrollId_isActive_idx" ON "bankroll_alerts"("bankrollId", "isActive");

-- CreateIndex
CREATE INDEX "bets_bankrollId_userId_idx" ON "bets"("bankrollId", "userId");

-- CreateIndex
CREATE INDEX "bets_userId_result_placedAt_idx" ON "bets"("userId", "result", "placedAt" DESC);

-- CreateIndex
CREATE INDEX "bets_bankrollId_result_idx" ON "bets"("bankrollId", "result");

-- CreateIndex
CREATE INDEX "bets_result_placedAt_idx" ON "bets"("result", "placedAt" DESC);

-- CreateIndex
CREATE INDEX "bets_externalMatchId_idx" ON "bets"("externalMatchId");

-- CreateIndex
CREATE INDEX "bets_apiSportsEventId_idx" ON "bets"("apiSportsEventId");

-- CreateIndex
CREATE INDEX "bets_sport_result_idx" ON "bets"("sport", "result");

-- CreateIndex
CREATE INDEX "bets_market_result_idx" ON "bets"("market", "result");

-- CreateIndex
CREATE INDEX "bets_settledAt_idx" ON "bets"("settledAt");

-- CreateIndex
CREATE UNIQUE INDEX "external_matches_apiSportsEventId_key" ON "external_matches"("apiSportsEventId");

-- CreateIndex
CREATE UNIQUE INDEX "external_matches_tsdbEventId_key" ON "external_matches"("tsdbEventId");

-- CreateIndex
CREATE UNIQUE INDEX "external_matches_externalMatchDetailsId_key" ON "external_matches"("externalMatchDetailsId");

-- CreateIndex
CREATE INDEX "external_matches_apiSportsEventId_idx" ON "external_matches"("apiSportsEventId");

-- CreateIndex
CREATE INDEX "external_matches_status_eventDate_idx" ON "external_matches"("status", "eventDate");

-- CreateIndex
CREATE INDEX "external_matches_eventDate_idx" ON "external_matches"("eventDate" DESC);

-- CreateIndex
CREATE INDEX "external_matches_sport_league_idx" ON "external_matches"("sport", "league");

-- CreateIndex
CREATE INDEX "external_matches_apiSource_apiSportsEventId_idx" ON "external_matches"("apiSource", "apiSportsEventId");

-- CreateIndex
CREATE UNIQUE INDEX "external_match_details_externalMatchId_key" ON "external_match_details"("externalMatchId");

-- CreateIndex
CREATE INDEX "match_statistics_externalMatchId_period_idx" ON "match_statistics"("externalMatchId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "match_statistics_externalMatchId_teamId_period_key" ON "match_statistics"("externalMatchId", "teamId", "period");

-- CreateIndex
CREATE INDEX "match_events_externalMatchId_minute_idx" ON "match_events"("externalMatchId", "minute");

-- CreateIndex
CREATE INDEX "match_events_eventType_idx" ON "match_events"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "match_lineups_externalMatchId_teamId_key" ON "match_lineups"("externalMatchId", "teamId");

-- CreateIndex
CREATE INDEX "player_match_stats_playerId_idx" ON "player_match_stats"("playerId");

-- CreateIndex
CREATE INDEX "player_match_stats_externalMatchId_rating_idx" ON "player_match_stats"("externalMatchId", "rating" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "player_match_stats_externalMatchId_playerId_key" ON "player_match_stats"("externalMatchId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Image_userId_key" ON "Image"("userId");

-- AddForeignKey
ALTER TABLE "client_data" ADD CONSTRAINT "client_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_clientDataId_fkey" FOREIGN KEY ("clientDataId") REFERENCES "client_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankrolls" ADD CONSTRAINT "bankrolls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankroll_histories" ADD CONSTRAINT "bankroll_histories_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankroll_histories" ADD CONSTRAINT "bankroll_histories_betId_fkey" FOREIGN KEY ("betId") REFERENCES "bets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankroll_streaks" ADD CONSTRAINT "bankroll_streaks_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankroll_records" ADD CONSTRAINT "bankroll_records_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankroll_goals" ADD CONSTRAINT "bankroll_goals_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots_daily" ADD CONSTRAINT "snapshots_daily_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots_weekly" ADD CONSTRAINT "snapshots_weekly_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots_monthly" ADD CONSTRAINT "snapshots_monthly_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots_yearly" ADD CONSTRAINT "snapshots_yearly_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bankroll_alerts" ADD CONSTRAINT "bankroll_alerts_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_bankrollId_fkey" FOREIGN KEY ("bankrollId") REFERENCES "bankrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_externalMatchId_fkey" FOREIGN KEY ("externalMatchId") REFERENCES "external_matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_match_details" ADD CONSTRAINT "external_match_details_externalMatchId_fkey" FOREIGN KEY ("externalMatchId") REFERENCES "external_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_externalMatchId_fkey" FOREIGN KEY ("externalMatchId") REFERENCES "external_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_externalMatchId_fkey" FOREIGN KEY ("externalMatchId") REFERENCES "external_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_externalMatchId_fkey" FOREIGN KEY ("externalMatchId") REFERENCES "external_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_externalMatchId_fkey" FOREIGN KEY ("externalMatchId") REFERENCES "external_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
