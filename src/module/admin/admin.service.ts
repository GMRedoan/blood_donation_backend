import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const verifyRequest = async (requestId: string, userId: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new AppError(404, "Blood request not found");
  }

  if (request.status !== "PENDING") {
    throw new AppError(400, "This blood request is already verified");
  }

  const updatedRequest = await prisma.bloodRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: "VERIFIED",
      verifiedById: userId,
      verifiedAt: new Date(),
    },
  });

  return updatedRequest;
};

const verifyCampaign = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }

  if (campaign.deletedAt) {
    throw new AppError(400, "Campaign has been deleted");
  }

  if (campaign.status !== "PENDING") {
    throw new AppError(400, "Only pending campaigns can be approved");
  }

  const updatedCampaign = await prisma.campaign.update({
    where: {
      id: campaignId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  return updatedCampaign;
};

export const adminService = {
  verifyRequest,
  verifyCampaign,
};