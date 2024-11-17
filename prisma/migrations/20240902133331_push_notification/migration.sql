/*
  Warnings:

  - You are about to drop the column `pushNotifications` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pwa"."Profile" DROP COLUMN "pushNotifications";

-- CreateTable
CREATE TABLE "pwa"."PushNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscription" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PushNotification_userId_key" ON "pwa"."PushNotification"("userId");

-- AddForeignKey
ALTER TABLE "pwa"."PushNotification" ADD CONSTRAINT "PushNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
