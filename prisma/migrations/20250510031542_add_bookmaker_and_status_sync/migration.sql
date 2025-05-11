-- AlterTable
ALTER TABLE "Bankroll" ADD COLUMN     "bookmaker" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "statusSync" TEXT NOT NULL DEFAULT 'pending';
