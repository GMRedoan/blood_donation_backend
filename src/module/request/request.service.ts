import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IRequestFilters } from "./request.interface";

const getAllRequest = async (filters: IRequestFilters) => {
  const {
    bloodGroup,
    city,
    area,
    requesterType,
    urgency,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const where = {
    ...(bloodGroup && { bloodGroup }),
    ...(requesterType && { requesterType }),
    ...(urgency && { urgency }),
    ...(status && { status }),

    ...(city && {
      city: {
        contains: city,
        mode: "insensitive" as const,
      },
    }),

    ...(area && {
      area: {
        contains: area,
        mode: "insensitive" as const,
      },
    }),
  };

  const skip = (page - 1) * limit;

  const [result, total] = await prisma.$transaction([
    prisma.bloodRequest.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),

    prisma.bloodRequest.count({
      where,
    }),
  ]);

  return {
    requests: result,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRequestById = async (requestId: string) => {
  if (!requestId) {
    throw new AppError(400, "Request ID is required");
  }
  const request = await prisma.bloodRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  if (!request) {
    throw new AppError(404, "Request not found");
  }
  return request;
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

export const requestService = {
  getAllRequest,
  getRequestById,
  acceptMatch,
};
