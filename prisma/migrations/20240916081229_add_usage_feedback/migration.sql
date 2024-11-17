-- CreateTable
CREATE TABLE "pwa"."UsageFeedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "comment" TEXT,
    "imageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageFeedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pwa"."UsageFeedback" ADD CONSTRAINT "UsageFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
