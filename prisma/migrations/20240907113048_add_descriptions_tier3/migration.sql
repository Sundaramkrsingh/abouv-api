/*
  Warnings:

  - You are about to drop the column `descriptions` on the `Tier3` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pwa"."Tier3" DROP COLUMN "descriptions",
ADD COLUMN     "descriptionLong" TEXT,
ADD COLUMN     "descriptionShort" TEXT;
