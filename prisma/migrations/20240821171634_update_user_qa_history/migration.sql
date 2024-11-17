/*
  Warnings:

  - You are about to drop the column `answerId` on the `UserQAHistory` table. All the data in the column will be lost.
  - You are about to drop the column `traitResponse` on the `UserQAHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pwa"."UserQAHistory" DROP COLUMN "answerId",
DROP COLUMN "traitResponse",
ADD COLUMN     "optionId" TEXT,
ADD COLUMN     "traitSelection" TEXT,
ADD COLUMN     "traitStat" JSONB;
