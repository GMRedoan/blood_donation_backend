import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { campaignService } from "./campaign.service";

const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const userId = req.user?.id;

  const campaign = await campaignService.createCampaign(
    payload,
    userId as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Campaign created successfully",
    data: campaign,
  });
});

export const campaignController = {
  createCampaign,
};