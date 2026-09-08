import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/browser";
import { adminController } from "./admin.controller";

const router = Router();

router.patch("/request/verify/:requestId", 
    auth(Role.ADMIN),
    adminController.verifyRequest);

router.patch("/campaign/verify/:id",
    auth(Role.ADMIN),
    adminController.verifyCampaign);

router.get("/users", 
    auth(Role.ADMIN),
     adminController.getAllUsers);

export const adminRouter = router;