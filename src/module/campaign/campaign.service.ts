import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateCampaignPayload } from "./campaign.interface";

const createCampaign = async (
  payload: ICreateCampaignPayload,
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(400, "User is deleted, please contact support");
  }

  if (user.role !== "ADMIN" && user.role !== "HOSPITAL") {
    throw new AppError(403, "Only admin or hospital can create campaigns");
  }

  const status = user.role === "ADMIN" ? "ACTIVE" : "PENDING";

  const campaign = await prisma.campaign.create({
    data: {
      title: payload.title,
      description: payload.description,
      targetAmount: payload.targetAmount,
      requestId: payload.requestId,
      createdById: userId,
      status,
    },
  });

  return campaign;
};

const getAllCampaigns = async () => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return campaigns;
};

const getCampaignById = async (campaignId: string) => {
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

  return campaign;
};

const getMyCampaign = async (userId: string) => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      createdById: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return campaigns;
}

const getCampaignContributionHistory = async (campaignId: string, userId: string) => {
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

  if (campaign.createdById !== userId) {
    throw new AppError(403, "You are not authorized to view this campaign");
  }

  const contributions = await prisma.contribution.findMany({
    where: {
      campaignId: campaignId,
    },
    include: {
      contributor:{
        select: {
          name: true,
          email: true,
          phone: true,
        }
      },
    },
  });   

  return contributions;
}

export const campaignService = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getMyCampaign,
  getCampaignContributionHistory
};