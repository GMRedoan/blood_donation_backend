import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { BloodGroup, RequesterType, RequestStatus } from "../../../generated/prisma/browser";
import { requestService } from "./request.service";

const getAllRequest = catchAsync(async (req: Request, res: Response) => {
  const {
    bloodGroup,
    city,
    area,
    requesterType,
    urgency,
    status,
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;

  const requests = await requestService.getAllRequest({
    bloodGroup: bloodGroup as BloodGroup,
    city: city as string,
    area: area as string,
    requesterType: requesterType as RequesterType,
    urgency: urgency as string,
    status: status as RequestStatus,
    sortBy: sortBy as "createdAt" | "updatedAt" | "urgency" | "unitsNeeded",
    sortOrder: sortOrder as "asc" | "desc",
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "requests fetched successfully",
    data: requests,
  });
});

const getRequestById = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.id;
  const request = await requestService.getRequestById(requestId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "request fetched successfully",
    data: request,
  });
});

const acceptMatch = catchAsync(async (req: Request, res: Response) => {
  const matchId = req.params.id;
  const userId = req.user?.id;
  const { scheduledAt } = req.body;

  const result = await requestService.acceptMatch(
    matchId as string,
    userId,
    scheduledAt,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donor accepted and donation scheduled successfully",
    data: result,
  });
});

export const requestController = {
  getAllRequest,
  getRequestById,
  acceptMatch,
};