-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pwa";

-- CreateEnum
CREATE TYPE "pwa"."Role" AS ENUM ('JOB_SEEKER', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "pwa"."LoginAttemptsStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "pwa"."ProfileGender" AS ENUM ('MALE', 'FEMALE', 'RATHER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "pwa"."QuestionType" AS ENUM ('MCQ');

-- CreateEnum
CREATE TYPE "pwa"."TestType" AS ENUM ('MIXED_MODE');

-- CreateEnum
CREATE TYPE "pwa"."TestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "pwa"."TrumpType" AS ENUM ('POWER_UPS', 'WILDCARD');

-- CreateEnum
CREATE TYPE "pwa"."TrumpCodeName" AS ENUM ('PLUS_5_SECONDS', 'PLUS_10_SECONDS', 'TWICE_UP', 'THRICE_UP', 'DICE_UP', 'ASK_ABA', 'BETTER_HALF', 'CHOSEN_ONE', 'DOUBLE_EDGE', 'TIME_MACHINE');

-- CreateTable
CREATE TABLE "pwa"."User" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "pwa"."Role" NOT NULL DEFAULT 'JOB_SEEKER',
    "isPhoneNumberVerified" BOOLEAN NOT NULL DEFAULT false,
    "isNewUser" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "otp" INTEGER,
    "otpGeneratedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "token" TEXT,
    "loggedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."LoginAttempts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "status" "pwa"."LoginAttemptsStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "avatar" TEXT,
    "username" TEXT,
    "fullName" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT,
    "email" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "dob" TIMESTAMP(3),
    "gender" "pwa"."ProfileGender",
    "resume" TEXT,
    "goal" INTEGER[],
    "referredBy" INTEGER,
    "referredUsers" JSONB[],
    "profileCompletion" TEXT,
    "isProfileHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "electivesSetAt" TIMESTAMP(3),

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Elective" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "tier1Id" INTEGER NOT NULL,
    "tier2Id" INTEGER NOT NULL,
    "tier3Id" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Elective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Address" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "line1" TEXT,
    "country" TEXT,
    "state" TEXT,
    "cityDistrict" TEXT,
    "pincode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."WorkExperience" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Project" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."LicenseCertification" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Education" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "schoolCollage" TEXT NOT NULL,
    "university" TEXT,
    "degree" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."AwardAchievement" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwardAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Tier1" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "foregroundColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Tier2" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tier1Id" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Tier3" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tier2Id" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."QuestionTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Question" (
    "id" SERIAL NOT NULL,
    "type" "pwa"."QuestionType" NOT NULL,
    "tier1Id" INTEGER NOT NULL,
    "tier2Id" INTEGER NOT NULL,
    "tier3Id" INTEGER NOT NULL,
    "staticDL" INTEGER NOT NULL,
    "dynamicDL" INTEGER,
    "tags" INTEGER[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "avgTime" DECIMAL(3,1),
    "accuracy" INTEGER,
    "timeLimit" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."MCQQA" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB[],
    "answer" TEXT NOT NULL,
    "triviaContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MCQQA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."Feedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "isPositive" BOOLEAN,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."TriviaSetting" (
    "id" SERIAL NOT NULL,
    "correctResponseHeading" TEXT[],
    "incorrectResponseHeading" TEXT[],
    "contentHeading" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TriviaSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."QAHistory" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT,
    "url" TEXT,
    "options" JSONB[],
    "answer" TEXT,
    "staticDL" INTEGER,
    "tags" INTEGER[],
    "isPublished" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QAHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."UserQAHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL DEFAULT 0,
    "stageId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "tier1Id" INTEGER NOT NULL,
    "tier2Id" INTEGER NOT NULL,
    "tier3Id" INTEGER NOT NULL,
    "testType" "pwa"."TestType" NOT NULL,
    "questionId" INTEGER NOT NULL,
    "currentQuestionNo" INTEGER NOT NULL,
    "noOfAttempts" INTEGER NOT NULL DEFAULT 1,
    "timeSpent" INTEGER,
    "isQuestionSkipped" BOOLEAN NOT NULL DEFAULT false,
    "isCorrect" BOOLEAN,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQAHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."StageHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "tier1" INTEGER[],
    "tier2" INTEGER[],
    "tier3" INTEGER[],
    "testStatus" "pwa"."TestStatus" NOT NULL,
    "questionTypes" TEXT[],
    "totalQuestions" INTEGER NOT NULL,
    "totalCorrectAnswers" INTEGER NOT NULL,
    "totalTimeSpent" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."TrumpSetting" (
    "id" SERIAL NOT NULL,
    "type" "pwa"."TrumpType" NOT NULL,
    "text" TEXT NOT NULL,
    "codeName" "pwa"."TrumpCodeName" NOT NULL,

    CONSTRAINT "TrumpSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."StageSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endDay" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "questionSelectionDL" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."GradeSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "minPercentage" INTEGER NOT NULL,
    "maxPercentage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."GoalSetting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GoalSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pwa"."TrumpsConsumption" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "powerUpId" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isConsumed" BOOLEAN NOT NULL DEFAULT false,
    "nextIn" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrumpsConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "pwa"."User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "pwa"."Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "pwa"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "pwa"."Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Address_profileId_key" ON "pwa"."Address"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Tier1_name_key" ON "pwa"."Tier1"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tier2_name_key" ON "pwa"."Tier2"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tier3_name_key" ON "pwa"."Tier3"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTag_name_key" ON "pwa"."QuestionTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MCQQA_questionId_key" ON "pwa"."MCQQA"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MCQQA_text_key" ON "pwa"."MCQQA"("text");

-- CreateIndex
CREATE UNIQUE INDEX "MCQQA_answer_key" ON "pwa"."MCQQA"("answer");

-- CreateIndex
CREATE UNIQUE INDEX "TrumpSetting_text_key" ON "pwa"."TrumpSetting"("text");

-- CreateIndex
CREATE UNIQUE INDEX "TrumpSetting_codeName_key" ON "pwa"."TrumpSetting"("codeName");

-- CreateIndex
CREATE UNIQUE INDEX "StageSetting_level_key" ON "pwa"."StageSetting"("level");

-- CreateIndex
CREATE UNIQUE INDEX "GradeSetting_name_key" ON "pwa"."GradeSetting"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GradeSetting_level_key" ON "pwa"."GradeSetting"("level");

-- CreateIndex
CREATE UNIQUE INDEX "GoalSetting_name_key" ON "pwa"."GoalSetting"("name");

-- AddForeignKey
ALTER TABLE "pwa"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."LoginAttempts" ADD CONSTRAINT "LoginAttempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Elective" ADD CONSTRAINT "Elective_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Elective" ADD CONSTRAINT "Elective_tier1Id_fkey" FOREIGN KEY ("tier1Id") REFERENCES "pwa"."Tier1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Elective" ADD CONSTRAINT "Elective_tier2Id_fkey" FOREIGN KEY ("tier2Id") REFERENCES "pwa"."Tier2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Address" ADD CONSTRAINT "Address_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."WorkExperience" ADD CONSTRAINT "WorkExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."LicenseCertification" ADD CONSTRAINT "LicenseCertification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."AwardAchievement" ADD CONSTRAINT "AwardAchievement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "pwa"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Tier2" ADD CONSTRAINT "Tier2_tier1Id_fkey" FOREIGN KEY ("tier1Id") REFERENCES "pwa"."Tier1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Tier3" ADD CONSTRAINT "Tier3_tier2Id_fkey" FOREIGN KEY ("tier2Id") REFERENCES "pwa"."Tier2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Question" ADD CONSTRAINT "Question_tier1Id_fkey" FOREIGN KEY ("tier1Id") REFERENCES "pwa"."Tier1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Question" ADD CONSTRAINT "Question_tier2Id_fkey" FOREIGN KEY ("tier2Id") REFERENCES "pwa"."Tier2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Question" ADD CONSTRAINT "Question_tier3Id_fkey" FOREIGN KEY ("tier3Id") REFERENCES "pwa"."Tier3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."MCQQA" ADD CONSTRAINT "MCQQA_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pwa"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."Feedback" ADD CONSTRAINT "Feedback_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pwa"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."QAHistory" ADD CONSTRAINT "QAHistory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pwa"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "pwa"."StageSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "pwa"."GradeSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_tier1Id_fkey" FOREIGN KEY ("tier1Id") REFERENCES "pwa"."Tier1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_tier2Id_fkey" FOREIGN KEY ("tier2Id") REFERENCES "pwa"."Tier2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_tier3Id_fkey" FOREIGN KEY ("tier3Id") REFERENCES "pwa"."Tier3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."UserQAHistory" ADD CONSTRAINT "UserQAHistory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pwa"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."StageHistory" ADD CONSTRAINT "StageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."StageHistory" ADD CONSTRAINT "StageHistory_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "pwa"."StageSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."StageHistory" ADD CONSTRAINT "StageHistory_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "pwa"."GradeSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."TrumpsConsumption" ADD CONSTRAINT "TrumpsConsumption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pwa"."TrumpsConsumption" ADD CONSTRAINT "TrumpsConsumption_powerUpId_fkey" FOREIGN KEY ("powerUpId") REFERENCES "pwa"."TrumpSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
