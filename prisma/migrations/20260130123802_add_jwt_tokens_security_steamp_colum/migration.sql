/*
  Warnings:

  - The required column `securityStamp` was added to the `jwt_tokens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "jwt_tokens" ADD COLUMN     "securityStamp" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "jwt_tokens_securityStamp_idx" ON "jwt_tokens"("securityStamp");
