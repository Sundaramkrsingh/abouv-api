/*
  Warnings:

  - Added the required column `cardBackgroundColor` to the `Tier1` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardBorderColor` to the `Tier1` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chipForegroundColor` to the `Tier1` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pwa"."Tier1" ADD COLUMN     "cardBackgroundColor" TEXT NOT NULL,
ADD COLUMN     "cardBorderColor" TEXT NOT NULL,
ADD COLUMN     "chipForegroundColor" TEXT NOT NULL;
