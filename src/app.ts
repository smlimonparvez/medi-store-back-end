import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./middlewares/error.middleware";
import { generalLimiter } from "./middlewares/rateLimiter.middleware";
import PaymentController from "./modules/payment/payment.controller";

import authRoutes     from "./modules/auth/auth.route";
import categoryRoutes from "./modules/category/category.route";
import medicineRoutes from "./modules/medicine/medicine.route";
import orderRoutes    from "./modules/order/order.route";
import reviewRoutes   from "./modules/review/review.route";
import sellerRoutes   from "./modules/seller/seller.route";
import adminRoutes    from "./modules/admin/admin.route";
import paymentRoutes  from "./modules/payment/payment.route";

const app: Application = express();

// ── Stripe webhook ────────────────────────────────────────────────────────
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.webhook
);

// ── Global middlewares ────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,  
  process.env.FRONTEND_URL_2,       
  "http://localhost:3000",  
  "http://localhost:3001",         
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General rate limiter — applied to all API routes
app.use("/api", generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/medicines",  medicineRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/reviews",    reviewRoutes);
app.use("/api/seller",     sellerRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/payments",   paymentRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "MediStore API is running!" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
