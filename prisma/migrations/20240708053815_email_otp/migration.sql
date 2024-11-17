-- CreateTable
CREATE TABLE "pwa"."EmailVerificationOTP" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationOTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationOTP_userId_key" ON "pwa"."EmailVerificationOTP"("userId");

-- AddForeignKey
ALTER TABLE "pwa"."EmailVerificationOTP" ADD CONSTRAINT "EmailVerificationOTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pwa"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
