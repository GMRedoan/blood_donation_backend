/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Contribution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Contribution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Contribution_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "stripeCheckoutSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_stripeCheckoutSessionId_key" ON "Contribution"("stripeCheckoutSessionId");
