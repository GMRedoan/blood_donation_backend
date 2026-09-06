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

export const adminController = {
  verifyRequest,
};