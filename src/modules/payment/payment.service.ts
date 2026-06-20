import Stripe from "stripe";
import prisma from "../../config/prisma";
import config from "../../config";
import AppError from "../../utils/AppError";

const stripe = new Stripe(config.stripeSecretKey);

type StripeSessionPayload = {
  customerId: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  notes?: string;
  items: { medicineId: number; quantity: number }[];
  frontendUrl: string;
};

const createCheckoutSession = async (payload: StripeSessionPayload) => {
  const { customerId, shippingAddress, shippingCity, shippingPhone, notes, items, frontendUrl } = payload;

  if (!items || items.length === 0) throw new AppError("Order must have at least one item.", 400);

  type ItemData = { medicineId: number; quantity: number; unitPrice: number; name: string; image?: string };
  const itemsData: ItemData[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const medicine = await prisma.medicine.findUnique({ where: { id: item.medicineId } });
    if (!medicine) throw new AppError(`Medicine with ID ${item.medicineId} not found.`, 404);
    if (medicine.stock < item.quantity) throw new AppError(`Not enough stock for "${medicine.name}". Only ${medicine.stock} unit(s) available.`, 400);
    const unitPrice = Number(medicine.price);
    totalAmount += unitPrice * item.quantity;
    itemsData.push({ medicineId: item.medicineId, quantity: item.quantity, unitPrice, name: medicine.name, image: medicine.image || undefined });
  }

  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        customerId, totalAmount, shippingAddress, shippingCity, shippingPhone, notes,
        paymentMethod: "stripe", paymentStatus: "pending",
        orderItems: { create: itemsData.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity, unitPrice: i.unitPrice })) },
      },
    });
    for (const item of itemsData) {
      await tx.medicine.update({ where: { id: item.medicineId }, data: { stock: { decrement: item.quantity } } });
    }
    return newOrder;
  });

  const lineItems = itemsData.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name, ...(item.image ? { images: [item.image] } : {}) },
      unit_amount: Math.round(item.unitPrice * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${frontendUrl}/checkout/cancel?order_id=${order.id}`,
    metadata: { orderId: String(order.id), customerId: String(customerId) },
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

  return { sessionUrl: session.url, orderId: order.id, sessionId: session.id };
};

const handleWebhook = async (rawBody: Buffer, signature: string) => {
  // Using any here because Stripe v22 changed how Event/Session types are exported
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
  } catch (err: any) {
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session: any = event.data.object;
    const orderId = parseInt(session.metadata?.orderId || "0");
    if (orderId) await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "paid" } });
  }

  if (event.type === "checkout.session.expired") {
    const session: any = event.data.object;
    const orderId = parseInt(session.metadata?.orderId || "0");
    if (orderId) await cancelFailedOrder(orderId);
  }
};

const cancelFailedOrder = async (orderId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
  if (!order || order.paymentStatus === "paid") return;
  await prisma.$transaction(async (tx: any) => {
    for (const item of order.orderItems) {
      await tx.medicine.update({ where: { id: item.medicineId }, data: { stock: { increment: item.quantity } } });
    }
    await tx.order.update({ where: { id: orderId }, data: { status: "cancelled", paymentStatus: "failed" } });
  });
};

const cancelPendingOrder = async (orderId: number, customerId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found.", 404);
  if (order.customerId !== customerId) throw new AppError("Unauthorized.", 403);
  if (order.paymentStatus === "paid") throw new AppError("This order has already been paid.", 400);
  await cancelFailedOrder(orderId);
};

const PaymentService = { createCheckoutSession, handleWebhook, cancelPendingOrder };
export default PaymentService;
