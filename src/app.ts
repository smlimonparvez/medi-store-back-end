import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/error.middleware";

import authRoutes from "./modules/auth/auth.route";
import categoryRoutes from "./modules/category/category.route";
import medicineRoutes from "./modules/medicine/medicine.route";
import orderRoutes from "./modules/order/order.route";
import reviewRoutes from "./modules/review/review.route";
import sellerRoutes from "./modules/seller/seller.route";
import adminRoutes from "./modules/admin/admin.route";

const app: Application = express();

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "💊 MediStore API is running!" });
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(globalErrorHandler);

export default app;