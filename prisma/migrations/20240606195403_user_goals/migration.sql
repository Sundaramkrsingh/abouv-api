/*
  Warnings:

  - You are about to drop the column `goal` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pwa"."Profile" DROP COLUMN "goal";

-- CreateTable
CREATE TABLE "pwa"."UserGoal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "goals" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_key" ON "pwa"."UserGoal"("userId");

-- AddForeignKey
ALTER TABLE "pwa"."UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
