import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { adminService } from "./admin.service";

const verifyRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.requestId;
  const userId = req.user?.id;
  const result = await adminService.verifyRequest(requestId as string, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blood request verified successfully",
    data: result,
  });
});

const verifyCampaign = catchAsync(async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const status = req.body.status;
  const result = await adminService.verifyCampaign(campaignId as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Campaign verified successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminService.softDeleteUser(userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const restoreUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await adminService.restoreUser(userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User restored successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const status = req.body.status;
  const user = await adminService.updateUserStatus(userId as string, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: {user},
  });
});

const getDeletedUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getDeletedUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Deleted users fetched successfully",
    data: users,
  });
});

const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getPendingRequests();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending users fetched successfully",
    data: users,
  });
});

export const adminController = {
  verifyRequest,
  verifyCampaign,
  getAllUsers,
  softDeleteUser,
  restoreUser,
  updateUserStatus,
  getDeletedUsers,
  getPendingRequests,
};