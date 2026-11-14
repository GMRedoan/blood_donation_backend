import { Router } from "express";
import { authController } from "./auth.controller";
import { UserValidation } from "./authValidation";
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
router.post("/login", authController.loginUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR, Role.HOSPITAL),
  authController.getMe,
);
router.post("/google", authController.googleLogin);
router.patch(
  "/me",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR, Role.HOSPITAL),
  authController.updateUser,
);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/reset-password",
  validateRequest(UserValidation.resetPasswordSchema),
  authController.resetPassword,
);


export const authRouter = router;
