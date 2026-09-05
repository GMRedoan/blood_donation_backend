import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateRequestPayload } from "./patient.interface";

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
  });
  return requests;
};

export const patientService = {
  createRequest,
  getMyRequest,
};