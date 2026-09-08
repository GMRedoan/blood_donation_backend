import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/browser";
import validateRequest from "../../middleware/validationRequest";
import { CampaignValidation } from "./campaign.validation";
import { campaignController } from "./campaign.controller";

const router = Router();

router.post("/",
     auth(Role.ADMIN, Role.HOSPITAL),
     validateRequest(CampaignValidation.createCampaignValidationSchema),
     campaignController.createCampaign);

router.get("/",
    auth(Role.ADMIN, Role.HOSPITAL, Role.DONOR, Role.PATIENT),
    campaignController.getAllCampaigns);
    
router.get("/:id",
    auth(Role.ADMIN, Role.HOSPITAL, Role.DONOR, Role.PATIENT),
    campaignController.getCampaignById);

export const campaignRouter = router;