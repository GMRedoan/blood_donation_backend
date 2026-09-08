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

const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const campaigns = await campaignService.getAllCampaigns();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Campaigns fetched successfully",
    data: campaigns,
  });
});

const getCampaignById = catchAsync(async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const campaign = await campaignService.getCampaignById(campaignId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Campaign fetched successfully",
    data: campaign,
  });
});

const getMyCampaign = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const campaign = await campaignService.getMyCampaign(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Campaign fetched successfully",
    data: campaign,
  });
})

const getCampaignContributionHistory = catchAsync(async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const userId = req.user?.id;
  const campaign = await campaignService.getCampaignContributionHistory(campaignId as string, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Campaign fetched successfully",
    data: campaign,
  });
})

export const campaignController = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getMyCampaign,
  getCampaignContributionHistory
};