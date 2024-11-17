-- CreateTable
CREATE TABLE "pwa"."Quote" (
    "id" SERIAL NOT NULL,
    "quote" TEXT NOT NULL,
    "displayCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quote_key" ON "pwa"."Quote"("quote");
