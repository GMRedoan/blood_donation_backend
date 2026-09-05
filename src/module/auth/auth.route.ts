import { Router } from "express";
import { authController } from "./auth.controller";
import { UserValidation } from "./authValiadtion";
import validateRequest from "../../middleware/validationRequest";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/browser";

const router = Router();

router.post(
  "/register",
  validateRequest(UserValidation.createUserValidationSchema),
  authController.createUser,
);
router.post("/verify-email", authController.verifyEmail);
router.post("/donor-profile",
    auth(Role.DONOR),
    validateRequest(UserValidation.createDonorProfileValidationSchema),
    authController.createDonorProfile);
router.post("/login", authController.loginUser);

export const authRouter = router;