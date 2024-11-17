/*
  Warnings:

  - Added the required column `expiresAt` to the `EmailVerificationOTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmailVerificationOTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pwa"."EmailVerificationOTP" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
