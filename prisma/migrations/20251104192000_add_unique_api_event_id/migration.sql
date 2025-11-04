/*
  Warnings:

  - A unique constraint covering the columns `[apiEventId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_apiEventId_key" ON "public"."Event"("apiEventId");
