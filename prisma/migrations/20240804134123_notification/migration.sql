-- CreateEnum
CREATE TYPE "pwa"."NotificationType" AS ENUM ('MESSAGE', 'ALERT', 'REMINDER');

-- CreateTable
CREATE TABLE "pwa"."Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "pwa"."NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pwa"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
