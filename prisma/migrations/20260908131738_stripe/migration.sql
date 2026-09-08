/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_stripePaymentIntentId_key" ON "Contribution"("stripePaymentIntentId");
