-- CreateTable
CREATE TABLE "pwa"."Tests" (
    "id" INTEGER NOT NULL,
    "tier3Id" INTEGER NOT NULL,
    "abstract" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "totalQuestion" INTEGER NOT NULL,

    CONSTRAINT "Tests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pwa"."Tests" ADD CONSTRAINT "Tests_tier3Id_fkey" FOREIGN KEY ("tier3Id") REFERENCES "pwa"."Tier3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
