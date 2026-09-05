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

export const requestService = {
  getAllRequest,
  getRequestById,
};
