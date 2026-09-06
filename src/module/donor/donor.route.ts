import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/browser";
import { donorController } from "./donor.controller";
import { UserValidation } from "../auth/authValidation";
import validateRequest from "../../middleware/validationRequest";

const router = Router();

router.post(
  "/donor-profile",
  auth(Role.DONOR),
  validateRequest(UserValidation.createDonorProfileValidationSchema),
  donorController.createDonorProfile,
);

router.patch(
  "/donor-profile/me",
  auth(Role.DONOR),
  donorController.updateDonorProfile,
);

router.get("/eligibility", 
  auth(Role.DONOR), 
  donorController.getEligibility);

router.get(
    "/matching-requests",
    auth(Role.DONOR),
    donorController.getMatchingRequests,
  );


export const donorRouter = router;
