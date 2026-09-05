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

export const patientService = {
  createRequest,
  getMyRequest,
  updateRequest,
  deleteRequest,
};