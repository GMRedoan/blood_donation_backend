import { BloodGroup } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { IUpdateDonorProfilePayload } from "./donor.interface";

const createDonorProfile = async (
  userId: string,
  payload: {
    bloodGroup: BloodGroup;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Deleted user cannot create donor profile",
    );
  }

  const existingProfile = await prisma.donorProfile.findUnique({
    where: {
      userId,
    },
  });

  if (existingProfile) {
    throw new AppError(httpStatus.CONFLICT, "Donor profile already exists");
  }

  const donorProfile = await prisma.donorProfile.create({
    data: {
      userId,
      bloodGroup: payload.bloodGroup,
    },
  });

  return donorProfile;
};

const updateDonorProfile = async (
  payload: IUpdateDonorProfilePayload,
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (user.isDeleted === true) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "user is deleted, please contact support",
    );
  }

  const donorProfile = await prisma.donorProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!donorProfile) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "donor profile not found for this user",
    );
  }

  const updatedDonorProfile = await prisma.donorProfile.update({
    where: {
      userId,
    },
    data: {
      ...payload,
    },
  });

  return updatedDonorProfile;
};

const getEligibility = async (userId: string) => {
  const donor = await prisma.donorProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!donor) {
    throw new AppError(404, "Donor profile not found");
  }

  const lastDonation = await prisma.donation.findFirst({
    where: {
      donorId: userId,
      status: "COMPLETED",
      completedAt: {
        not: null,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  if (!lastDonation) {
    return {
      eligible: true,
      lastDonationAt: null,
      nextEligibleAt: null,
    };
  }

  const nextEligibleAt = new Date(lastDonation.completedAt!);
  nextEligibleAt.setMonth(nextEligibleAt.getMonth() + 3);

  const eligible = new Date() >= nextEligibleAt;

  return {
    eligible,
    lastDonationAt: lastDonation.completedAt,
    nextEligibleAt,
  };
};

const getMatchingRequests = async (userId: string) => {
  const donor = await prisma.donorProfile.findUnique({
    where: {
      userId,
    },
    include: {
       user: {
        select: {
          city: true,
          area: true,
        },
      },
    },
  });

  if (!donor) {
    throw new AppError(404, "Donor profile not found");
  }

  const lastDonation = await prisma.donation.findFirst({
    where: {
      donorId: userId,
      status: "COMPLETED",
      completedAt: {
        not: null,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  if (lastDonation?.completedAt) {
    const nextEligibleAt = new Date(lastDonation.completedAt);
    nextEligibleAt.setMonth(nextEligibleAt.getMonth() + 3);

    if (new Date() < nextEligibleAt) {
      return [];
    }
  }

  const requests = await prisma.bloodRequest.findMany({
    where: {
      status: "VERIFIED",
      bloodGroup: donor.bloodGroup,
      city: donor.user.city || "",
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
};

const createDonation = async (requestId: string, donorId: string) => {
  const donor = await prisma.donorProfile.findUnique({
    where: {
      userId: donorId,
    },
    include: {
      user: {
        select: {
          city: true,
          area: true,
        },
      },
    },
  });

  if (!donor) {
    throw new AppError(404, "Donor profile not found");
  }

  const lastDonation = await prisma.donation.findFirst({
    where: {
      donorId,
      status: "COMPLETED",
      completedAt: {
        not: null,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  if (lastDonation?.completedAt) {
    const nextEligibleAt = new Date(lastDonation.completedAt);

    nextEligibleAt.setMonth(nextEligibleAt.getMonth() + 3);

    if (new Date() < nextEligibleAt) {
      throw new AppError(
        400,
        `You are not eligible to donate until ${nextEligibleAt.toISOString()}`,
      );
    }
  }

  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!bloodRequest) {
    throw new AppError(404, "Blood request not found");
  }

  if (bloodRequest.status !== "VERIFIED") {
    throw new AppError(400, "This blood request is no longer accepting donors");
  }

  if (bloodRequest.deletedAt) {
    throw new AppError(400, "This blood request has been deleted");
  }

  if (donor.bloodGroup !== bloodRequest.bloodGroup) {
    throw new AppError(
      400,
      "Your blood group is not compatible with this request",
    );
  }

  if (donor.user.city !== bloodRequest.city) {
    throw new AppError(
      400,
      "You are not in the required city for this request",
    );
  }

  const existingMatch = await prisma.donorMatch.findUnique({
    where: {
      requestId_donorId: {
        requestId,
        donorId,
      },
    },
  });

  if (existingMatch) {
    throw new AppError(400, "You have already responded to this blood request");
  }

  const match = await prisma.donorMatch.create({
    data: {
      requestId,
      donorId,
      status: "PENDING",
    },
  });

  return match;
};

export const donorService = {
  createDonorProfile,
  updateDonorProfile,
  getEligibility,
  getMatchingRequests,
  createDonation,
};