import { CampaignStatus } from "../../../generated/prisma/enums";
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

const verifyCampaign = async (campaignId: string, status: CampaignStatus) => {
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
      status: status
    },
  });

  return updatedCampaign;
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
};

const softDeleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(400, "User is already deleted"); 
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return updatedUser;
};

const restoreUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (!user.isDeleted) {
    throw new AppError(400, "User is not deleted");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    omit: {
      password: true,
    },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });

  return updatedUser;
};

export const adminService = {
  verifyRequest,
  verifyCampaign,
  getAllUsers, 
  softDeleteUser,
  restoreUser
};