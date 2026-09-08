import { Router } from "express";
import { contributionController } from "./contribution.controller";
import { Role } from "../../../generated/prisma/browser";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/create", 
    auth(Role.PATIENT ,Role.DONOR, Role.ADMIN, Role.HOSPITAL), contributionController.createContribution); 

router.get("/history",
     auth(Role.ADMIN), contributionController.contributionHistory);

router.get("/history/me",
     auth(Role.PATIENT, Role.DONOR, Role.HOSPITAL, Role.ADMIN), 
     contributionController.myContributionHistory);

export const contributionRouter = router;