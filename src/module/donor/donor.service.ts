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

export const donorService = {
    createDonorProfile,
    updateDonorProfile,
};