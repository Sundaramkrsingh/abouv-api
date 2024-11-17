-- AlterTable
ALTER TABLE "pwa"."User" ADD COLUMN     "userRole" INTEGER;

-- CreateTable
CREATE TABLE "pwa"."Onboarding" (
    "id" SERIAL NOT NULL,
    "acquisitionChannel" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."RoleSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RoleSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."HearAbtUsSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HearAbtUsSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "pwa"."Onboarding"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleSetting_name_key" ON "pwa"."RoleSetting"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HearAbtUsSetting_name_key" ON "pwa"."HearAbtUsSetting"("name");

-- AddForeignKey
ALTER TABLE "pwa"."Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
