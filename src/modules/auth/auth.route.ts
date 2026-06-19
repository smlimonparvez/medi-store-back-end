import { Router, Request, Response, NextFunction } from "express";
import AuthController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { registerSchema, loginSchema, updateProfileSchema } from "../../utils/schemas";

const router = Router();

// Simple in-memory rate limiter — 10 attempts per IP per 15 min
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;
  const record = loginAttempts.get(ip);

  if (record) {
    if (now > record.resetAt) {
      loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (record.count >= maxAttempts) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000 / 60);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Try again in ${retryAfter} minute(s).`,
      });
    } else {
      record.count += 1;
    }
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
  }
  next();
};

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", loginRateLimit, validate(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.patch("/profile", authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
