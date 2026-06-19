import { Router } from "express";
import AdminController from "./admin.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { updateUserStatusSchema } from "../../utils/schemas";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", AdminController.getDashboardStats);
router.get("/users", AdminController.getAllUsers);
router.patch("/users/:id", validate(updateUserStatusSchema), AdminController.updateUserStatus);
router.get("/orders", AdminController.getAllOrders);

export default router;
