import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { donorService } from "./donor.service";

const createDonorProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user.id;
  const result = await donorService.createDonorProfile(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "donor profile created successfully",
    data: result,
  });
});

const updateDonorProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;
  const donorProfile = await donorService.updateDonorProfile(
    payload,
    userId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "donor profile updated successfully",
    data: { donorProfile },
  });
});

const getEligibility = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await donorService.getEligibility(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donor eligibility retrieved successfully",
    data: result,
  });
});

const getMatchingRequests = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const requests = await donorService.getMatchingRequests(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Matching blood requests retrieved successfully",
    data: requests,
  });
});

const createDonation = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.body;
  const donorId = req.user?.id;

  const match = await donorService.createDonation(requestId, donorId as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "You have successfully responded to this blood request",
    data: match,
  });
});

export const donorController = {
  createDonorProfile,
  updateDonorProfile,
  getEligibility,
  getMatchingRequests,
  createDonation,
};
