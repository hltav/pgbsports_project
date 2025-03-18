-- CreateTable
CREATE TABLE "Bankroll" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Bankroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "bankId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bankroll_name_key" ON "Bankroll"("name");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bankroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
