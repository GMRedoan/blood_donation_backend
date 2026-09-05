import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateRequestPayload } from "./request.interface";

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
  const { creator, ...requestData } = payload;
  const request = await prisma.bloodRequest.create({
    data: {
      ...requestData,
      creatorId: userId,
    },
  });
  return request;
};

export const requestService = {
  createRequest,
};
