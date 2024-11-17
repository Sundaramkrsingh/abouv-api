/*
  Warnings:

  - You are about to drop the column `traitType` on the `MCQPsychometricQA` table. All the data in the column will be lost.
  - You are about to drop the column `traitSelection` on the `UserQAHistory` table. All the data in the column will be lost.
  - Added the required column `traitTypeId` to the `MCQPsychometricQA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pwa"."MCQPsychometricQA" DROP COLUMN "traitType",
ADD COLUMN     "traitTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pwa"."UserQAHistory" DROP COLUMN "traitSelection",
ADD COLUMN     "traitIdSelection" INTEGER;

-- CreateTable
CREATE TABLE "pwa"."TraitType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tier3Id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TraitType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TraitType_name_key" ON "pwa"."TraitType"("name");

-- AddForeignKey
ALTER TABLE "pwa"."TraitType" ADD CONSTRAINT "TraitType_tier3Id_fkey" FOREIGN KEY ("tier3Id") REFERENCES "pwa"."Tier3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
