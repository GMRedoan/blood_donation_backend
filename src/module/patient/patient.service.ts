import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateRequestPayload, IUpdateRequestPayload } from "./patient.interface";

const createRequest = async (
  payload: ICreateRequestPayload,
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
  if (user.isDeleted === true) {
    throw new AppError(400, "User is deleted, please contact support");
  }
  const request = await prisma.bloodRequest.create({
    data: {
      ...payload,
      creatorId: userId,
    },
  });
  return request;
};

const getMyRequest = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (user.isDeleted === true) {
    throw new AppError(400, "User is deleted, please contact support");
  }
  const requests = await prisma.bloodRequest.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      matches: true,
    },
  });
  return requests;
};

const updateRequest = async (
  requestId: string,
  payload: IUpdateRequestPayload,
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
  if (user.isDeleted === true) {
    throw new AppError(400, "User is deleted, please contact support");
  }
  const request = await prisma.bloodRequest.findUnique({
    where: {
      id: requestId,
    },
  });
  if (!request) {
    throw new AppError(404, "Request not found");
  }
  if (request.creatorId !== userId) {
    throw new AppError(403, "You are not authorized to update this request");
  }
  const updatedRequest = await prisma.bloodRequest.update({
    where: {
      id: requestId,
    },
    data: {
      ...payload,
    },
  });
  return updatedRequest;
};

const deleteRequest = async (requestId: string, userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (user.isDeleted === true) {
    throw new AppError(400, "User is deleted, please contact support");
  }
  const request = await prisma.bloodRequest.findUnique({
    where: {
      id: requestId,
    },
  });
  if (!request) {
    throw new AppError(404, "Request not found");
  }
  if (request.creatorId !== userId) {
    throw new AppError(403, "You are not authorized to delete this request");
  }
  if(request.status === "VERIFIED" || request.status === "MATCHING") {
    throw new AppError(400, "You cannot delete an approved request");
  }
  await prisma.bloodRequest.delete({
    where: {
      id: requestId,
    },
  });
};

const acceptMatch = async (
  matchId: string,
  userId: string,
  scheduledAt: Date,
) => {
  const match = await prisma.donorMatch.findUnique({
    where: {
      id: matchId,
    },
    include: {
      request: true,
      donor: true,
    },
  });

  if (!match) {
    throw new AppError(404, "Donor match not found");
  }

  if (match.status !== "PENDING") {
    throw new AppError(400, "This donor match has already been processed");
  }

  const request = match.request;

  if (request.deletedAt) {
    throw new AppError(400, "This blood request has been deleted");
  }

  if (request.status !== "VERIFIED") {
    throw new AppError(400, "This blood request is no longer accepting donors");
  }

  if (request.creatorId !== userId) {
    throw new AppError(403, "You are not authorized to accept this donor");
  }

  if (scheduledAt <= new Date()) {
    throw new AppError(400, "Scheduled time must be in the future");
  }

  const lastDonation = await prisma.donation.findFirst({
    where: {
      donorId: match.donorId,
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
      throw new AppError(400, "This donor is currently not eligible to donate");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedMatch = await tx.donorMatch.update({
      where: {
        id: matchId,
      },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    const donation = await tx.donation.create({
      data: {
        requestId: match.requestId,
        donorId: match.donorId,
        status: "SCHEDULED",
        scheduledAt,
      },
    });

    return {
      match: updatedMatch,
      donation,
    };
  });

  return result;
};

export const patientService = {
  createRequest,
  getMyRequest,
  updateRequest,
  deleteRequest,
  acceptMatch,
};