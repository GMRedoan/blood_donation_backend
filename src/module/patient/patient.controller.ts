import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { patientService } from "./patient.service";

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;
  const request = await patientService.createRequest(payload, userId as string);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "request created successfully",
    data: request,
  });
});

const getMyRequest = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requests = await patientService.getMyRequest(userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "requests fetched successfully",
    data: requests,
  });
});

export const patientController = {
  createRequest,
  getMyRequest,
};
