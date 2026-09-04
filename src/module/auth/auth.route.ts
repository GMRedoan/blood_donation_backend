import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post(
  "/register",
//   validateRequest(UserValidation.createUserValidationSchema),
  authController.createUser,
);

router.post("/verify-email", authController.verifyEmail);

export const authRouter = router;