import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/browser";
import { adminController } from "./admin.controller";

const router = Router();

router.patch("/request/verify/:requestId", 
    auth(Role.ADMIN),
    adminController.verifyRequest);

export const adminRouter = router;