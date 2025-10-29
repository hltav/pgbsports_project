-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "apiEventId" TEXT,
ADD COLUMN     "awayTeam" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "homeTeam" TEXT;

-- CreateIndex
CREATE INDEX "Event_result_apiEventId_idx" ON "public"."Event"("result", "apiEventId");
