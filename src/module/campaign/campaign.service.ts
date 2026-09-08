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

export const campaignService = {
  createCampaign,
};