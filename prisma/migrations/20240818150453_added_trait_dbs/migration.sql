-- AlterTable
ALTER TABLE "pwa"."Question" ALTER COLUMN "staticDL" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pwa"."Tier3" ADD COLUMN     "descriptions" TEXT;

-- AlterTable
ALTER TABLE "pwa"."UserQAHistory" ADD COLUMN     "answerId" TEXT,
ADD COLUMN     "traitResponse" JSONB;

-- CreateTable
CREATE TABLE "pwa"."MCQPsychometricQA" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "traitType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCQPsychometricQA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."MCQPsychometricOptionsQA" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCQPsychometricOptionsQA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MCQPsychometricQA_questionId_key" ON "pwa"."MCQPsychometricQA"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MCQPsychometricQA_text_key" ON "pwa"."MCQPsychometricQA"("text");

-- CreateIndex
CREATE UNIQUE INDEX "MCQPsychometricOptionsQA_questionId_key" ON "pwa"."MCQPsychometricOptionsQA"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MCQPsychometricOptionsQA_text_key" ON "pwa"."MCQPsychometricOptionsQA"("text");

-- AddForeignKey
ALTER TABLE "pwa"."MCQPsychometricQA" ADD CONSTRAINT "MCQPsychometricQA_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pwa"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."MCQPsychometricOptionsQA" ADD CONSTRAINT "MCQPsychometricOptionsQA_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pwa"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
