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

export const adminService = {
  verifyRequest,
};