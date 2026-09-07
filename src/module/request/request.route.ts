import { Router } from "express";
import { requestController } from "./request.controller";
import { Role } from "../../../generated/prisma/browser";
import { auth } from "../../middleware/auth";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR, Role.HOSPITAL),
  requestController.getAllRequest,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.PATIENT, Role.DONOR, Role.HOSPITAL),
  requestController.getRequestById,
);

router.post(
  "/matches/:id/accept",
  auth(Role.PATIENT, Role.HOSPITAL),
  requestController.acceptMatch,
);

router.patch(
  "/donations/:id/complete",
  auth(Role.PATIENT, Role.HOSPITAL, Role.ADMIN),
  requestController.completeDonation,
);


export const requestRouter = router;
