-- AlterTable
ALTER TABLE "pwa"."MCQQA" ADD COLUMN     "stick" INTEGER;

-- AlterTable
ALTER TABLE "pwa"."Question" ADD COLUMN     "qTraitId" INTEGER,
ADD COLUMN     "taxonomyId" INTEGER;

-- CreateTable
CREATE TABLE "pwa"."QuestionTrait" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Taxonomy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTrait_name_key" ON "pwa"."QuestionTrait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_name_key" ON "pwa"."Taxonomy"("name");

-- AddForeignKey
ALTER TABLE "pwa"."Question" ADD CONSTRAINT "Question_qTraitId_fkey" FOREIGN KEY ("qTraitId") REFERENCES "pwa"."QuestionTrait"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Question" ADD CONSTRAINT "Question_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "pwa"."Taxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
