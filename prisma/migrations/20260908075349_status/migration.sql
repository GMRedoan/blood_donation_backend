-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "status" DROP DEFAULT;
