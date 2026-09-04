import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post(
  "/register",
//   validateRequest(UserValidation.createUserValidationSchema),
  authController.createUser,
);

export const authRoute = router;