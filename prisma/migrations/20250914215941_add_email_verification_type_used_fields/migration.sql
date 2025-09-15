-- AlterTable
ALTER TABLE "public"."EmailVerification" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'RESET_PASSWORD',
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;
