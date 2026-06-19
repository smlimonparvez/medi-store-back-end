import { Router } from "express";
import OrderController from "./order.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { createOrderSchema } from "../../utils/schemas";

const router = Router();

// IMPORTANT: /my-orders must be before /:id
router.post("/", authenticate, authorize("customer"), validate(createOrderSchema), OrderController.createOrder);
router.get("/my-orders", authenticate, authorize("customer"), OrderController.getMyOrders);
router.get("/:id", authenticate, OrderController.getOrderById);
router.patch("/:id/cancel", authenticate, authorize("customer"), OrderController.cancelOrder);

export default router;
