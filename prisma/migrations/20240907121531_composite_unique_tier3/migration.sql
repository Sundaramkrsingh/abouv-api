/*
  Warnings:

  - A unique constraint covering the columns `[name,tier2Id]` on the table `Tier3` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "pwa"."Tier3_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tier3_name_tier2Id_key" ON "pwa"."Tier3"("name", "tier2Id");
