import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { requestService } from "./request.service";

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;
  const request = await requestService.createRequest(payload, userId as string);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "request created successfully",
    data: request,
  });
});

export const requestController = {
  createRequest,
};