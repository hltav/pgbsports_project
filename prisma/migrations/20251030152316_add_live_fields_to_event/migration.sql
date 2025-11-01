-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "intRound" INTEGER DEFAULT 0,
ADD COLUMN     "strAwayTeamBadge" TEXT DEFAULT '',
ADD COLUMN     "strCountry" TEXT DEFAULT '',
ADD COLUMN     "strHomeTeamBadge" TEXT DEFAULT '',
ADD COLUMN     "strLeague" TEXT DEFAULT '',
ADD COLUMN     "strLeagueBadge" TEXT DEFAULT '',
ADD COLUMN     "strPostponed" TEXT DEFAULT 'no',
ADD COLUMN     "strSeason" TEXT DEFAULT '',
ADD COLUMN     "strStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "strThumb" TEXT DEFAULT '';
