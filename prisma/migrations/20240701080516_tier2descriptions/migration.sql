/*
  Warnings:

  - A unique constraint covering the columns `[descriptions]` on the table `Tier2` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "pwa"."Tier2" ADD COLUMN     "descriptions" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tier2_descriptions_key" ON "pwa"."Tier2"("descriptions");
