/*
  Warnings:

  - Made the column `securityStamp` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "securityStamp" SET NOT NULL;
