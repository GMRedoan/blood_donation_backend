import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  await authService.createUserIntoDB(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Verification code has been sent to your email",
    data: null,
  });
});

export const authController = {
  createUser,
};