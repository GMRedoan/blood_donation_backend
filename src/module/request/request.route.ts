import { Router } from "express";
import { requestController } from "./request.controller";
import { Role } from "../../../generated/prisma/browser";
import { auth } from "../../middleware/auth";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR),
  requestController.getAllRequest,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR),
  requestController.getRequestById,
);

export const requestRouter = router;
