import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { contributionService } from "./contribution.service";

const createContribution = catchAsync(async (req: Request, res: Response) => {
  const { campaignId, amount } = req.body;
  const userId = req.user?.id;
  const contribution = await contributionService.createContribution(
    campaignId,
    amount,
    userId as string,
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
  const contributions = await contributionService.contributionHistory();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "contribution history fetched successfully",
    data: { contributions },
  });
});

const myContributionHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const contributions = await contributionService.myContributionHistory(userId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "contribution history fetched successfully",
    data: { contributions },
  });
})


export const contributionController = {
  createContribution,
  confirmContribution,
  contributionHistory,
  myContributionHistory
};
