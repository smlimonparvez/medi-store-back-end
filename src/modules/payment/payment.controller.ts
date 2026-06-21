import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import PaymentService from "./payment.service";
import config from "../../config";
import { getQueryString } from "../../utils/types";

// Customer initiates Stripe checkout
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createCheckoutSession({
    ...req.body,
    customerId: req.user!.id,
    frontendUrl: config.frontendUrl,
  });

  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Stripe checkout session created.",
    data: result,
  });
});

// Stripe sends this after payment — must use raw body, NOT parsed JSON
const webhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).json({ success: false, message: "Missing stripe-signature header." });
  }

  try {
    await PaymentService.handleWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Customer cancelled payment — clean up the pending order
const cancelPendingOrder = catchAsync(async (req: Request, res: Response) => {
  const orderId = parseInt(getQueryString(req.params.orderId)!);
  await PaymentService.cancelPendingOrder(orderId, req.user!.id);

  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Order cancelled and stock restored.",
  });
});

const PaymentController = { createCheckoutSession, webhook, cancelPendingOrder };
export default PaymentController;
