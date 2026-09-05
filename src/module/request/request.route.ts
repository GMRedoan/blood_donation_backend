import { Router } from "express";
import { requestController } from "./request.controller";
import { Role } from "../../../generated/prisma/browser";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth(Role.PATIENT), 
requestController.createRequest);

export const requestRouter = router;
