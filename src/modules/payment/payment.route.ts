import { Router } from "express";
import PaymentController from "./payment.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { createOrderSchema } from "../../utils/schemas";

const router = Router();

// Customer creates a Stripe checkout session
router.post(
  "/create-checkout-session",
  authenticate,
  authorize("customer"),
  validate(createOrderSchema),
  PaymentController.createCheckoutSession
);

// Customer cancels a pending Stripe order (when they click "Go back" on cancel page)
router.delete(
  "/cancel/:orderId",
  authenticate,
  authorize("customer"),
  PaymentController.cancelPendingOrder
);

// NOTE: Stripe webhook is registered in app.ts BEFORE express.json()
// because it needs the raw body. It is NOT here.

export default router;
