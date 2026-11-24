import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { contributionService } from "./contribution.service";

const createContribution = catchAsync(async (req: Request, res: Response) => {
  const { campaignId, amount } = req.body;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const contribution = await contributionService.createContribution(
    campaignId,
    amount,
    userId as string,
    userRole 
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "contribution created successfully",
    data: { contribution },
  });
});

const confirmContribution = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const rawBody = req.body;
  const result = await contributionService.confirmContribution(rawBody, signature);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "contribution confirmed successfully",
    data: { result },
  });
});

const contributionHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await contributionService.contributionHistory();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "contribution history fetched successfully",
    data: result,
  });
});

const myContributionHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await contributionService.myContributionHistory(userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "contribution history fetched successfully",
    data: result,
  });
})


export const contributionController = {
  createContribution,
  confirmContribution,
  contributionHistory,
  myContributionHistory
};
