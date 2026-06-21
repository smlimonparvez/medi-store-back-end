import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "seller"], {
    error: "Role must be either customer or seller",
  }),
  phone: z.string().min(10).max(15).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  phone: z.string().min(10).max(15).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

// ── Category ─────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(50),
});

// ── Medicine ─────────────────────────────────────────────────────────────────

export const createMedicineSchema = z.object({
  name: z.string().min(2, "Medicine name must be at least 2 characters").max(100),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
  manufacturer: z.string().max(100).optional(),
  categoryId: z.coerce.number().int().positive("Please select a valid category"),
});

export const updateMedicineSchema = createMedicineSchema.partial();

// ── Order ─────────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(5, "Please enter a valid address").max(200),
  shippingCity: z.string().min(2, "Please enter a valid city").max(60),
  shippingPhone: z.string().min(10, "Please enter a valid phone number").max(15),
  notes: z.string().max(300).optional(),
  items: z
    .array(
      z.object({
        medicineId: z.number().int().positive(),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Order must have at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["placed", "processing", "shipped", "delivered", "cancelled"], {
    error: "Invalid order status",
  }),
});

// ── Review ────────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  medicineId: z.number().int().positive(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().max(500).optional(),
});

// ── Admin ─────────────────────────────────────────────────────────────────────

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "banned"], {
    error: "Status must be active or banned",
  }),
});
