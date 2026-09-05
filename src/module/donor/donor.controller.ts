import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "../auth/auth.service";
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

export const donorController = {
  createDonorProfile,
  updateDonorProfile,
};
