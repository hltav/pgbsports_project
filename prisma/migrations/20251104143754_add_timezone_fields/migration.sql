-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "dateEvent" TEXT,
ADD COLUMN     "dateEventLocal" TEXT,
ADD COLUMN     "strTime" TEXT,
ADD COLUMN     "strTimeLocal" TEXT,
ADD COLUMN     "strTimestamp" TEXT,
ADD COLUMN     "timezone" TEXT;

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "public"."Event"("eventDate");
