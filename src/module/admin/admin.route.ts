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

router.patch("/user/:id/delete", 
    auth(Role.ADMIN),
    adminController.softDeleteUser);

router.patch("/user/:id/restore", 
    auth(Role.ADMIN),
    adminController.restoreUser);

router.patch("/user/:id/status",
    auth(Role.ADMIN),
    adminController.updateUserStatus
)

router.get("/deletedUser",
    auth(Role.ADMIN),
    adminController.getDeletedUsers
)

router.get(
  "/pendingRequests",
  auth(Role.ADMIN),
  adminController.getPendingRequests,
);

export const adminRouter = router;