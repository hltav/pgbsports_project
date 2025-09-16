/*
  Warnings:

  - Changed the type of `type` on the `EmailVerification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."EmailVerificationType" AS ENUM ('EMAIL_CONFIRMATION', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "public"."EmailVerification" DROP COLUMN "type",
ADD COLUMN     "type" "public"."EmailVerificationType" NOT NULL;

-- DropEnum
DROP TYPE "public"."VerificationType";
