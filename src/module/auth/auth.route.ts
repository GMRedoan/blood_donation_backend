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
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR),
  authController.getMe,
);
router.patch(
  "/me",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR),
  authController.updateUser,
);

export const authRouter = router;
