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

const updateRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.requestId;
  const payload = req.body;
  const userId = req.user?.id;
  const updatedRequest = await patientService.updateRequest(
    requestId as string,
    payload,
    userId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "request updated successfully",
    data: updatedRequest,
  });
});

const deleteRequest = catchAsync(async (req: Request, res: Response) => {
  const requestId = req.params.requestId;
  const userId = req.user?.id;
  await patientService.deleteRequest(requestId as string, userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "request deleted successfully",
    data: null,
  });
});

export const patientController = {
  createRequest,
  getMyRequest,
  updateRequest,
  deleteRequest,
};
