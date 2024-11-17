-- CreateTable
CREATE TABLE "pwa"."UserCareerIssue" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "careerIssues" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCareerIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."CareerIssueSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CareerIssueSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCareerIssue_userId_key" ON "pwa"."UserCareerIssue"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerIssueSetting_name_key" ON "pwa"."CareerIssueSetting"("name");

-- AddForeignKey
ALTER TABLE "pwa"."UserCareerIssue" ADD CONSTRAINT "UserCareerIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
