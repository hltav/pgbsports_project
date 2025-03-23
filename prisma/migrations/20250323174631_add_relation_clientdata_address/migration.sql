-- CreateTable
CREATE TABLE "ClientData" (
    "id" SERIAL NOT NULL,
    "gender" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "direction" TEXT NOT NULL,
    "houseNumber" INTEGER NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "clientDataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientData_cpf_key" ON "ClientData"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "ClientData_userId_key" ON "ClientData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_clientDataId_key" ON "Address"("clientDataId");

-- AddForeignKey
ALTER TABLE "ClientData" ADD CONSTRAINT "ClientData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_clientDataId_fkey" FOREIGN KEY ("clientDataId") REFERENCES "ClientData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
