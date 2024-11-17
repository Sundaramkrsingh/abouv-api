-- CreateTable
CREATE TABLE "pwa"."UserStats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentStage" TEXT NOT NULL,
    "currentGrade" TEXT NOT NULL,
    "netScore" INTEGER NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "pwa"."UserStats"("userId");

-- AddForeignKey
ALTER TABLE "pwa"."UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
