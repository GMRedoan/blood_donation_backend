import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import validateRequest from "../../middleware/validationRequest";
import { RequestValidation } from "./patient.validation";
import { patientController } from "./patient.controller";

const router = Router();

router.post(
  "/request",
  auth(Role.PATIENT),
  validateRequest(RequestValidation.createRequestValidationSchema),
  patientController.createRequest,
);

router.get(
  "/myRequest",
  auth(Role.PATIENT),
  patientController.getMyRequest,
);

router.patch(
  "/myRequest/:requestId",
  auth(Role.PATIENT),
  patientController.updateRequest,
);

router.delete(
  "/myRequest/:requestId",
  auth(Role.PATIENT),
  patientController.deleteRequest,
);

export const patientRouter = router;