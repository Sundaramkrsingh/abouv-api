-- AddForeignKey
ALTER TABLE "pwa"."MCQPsychometricQA" ADD CONSTRAINT "MCQPsychometricQA_traitTypeId_fkey" FOREIGN KEY ("traitTypeId") REFERENCES "pwa"."TraitType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
