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

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.verifyEmail(payload);
  const { accessToken, refreshToken } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user verified successfully",
    data: { accessToken, refreshToken },
  });
});

const createDonorProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user.id;
  const result = await authService.createDonorProfile(userId, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "donor profile created successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { accessToken, refreshToken } = await authService.loginUser(payload);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "user logged in successfully",
    data: { accessToken, refreshToken },
  });
});
 
export const authController = {
  createUser,
  verifyEmail,
  createDonorProfile,
  loginUser,
};