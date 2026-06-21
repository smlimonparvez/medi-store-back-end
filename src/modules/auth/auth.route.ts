import { Router } from "express";
import AuthController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { loginLimiter } from "../../middlewares/rateLimiter.middleware";
import validate from "../../utils/validate";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../../utils/schemas";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);

// loginLimiter runs first — blocks IPs that exceed 10 failed attempts in 15 min
router.post("/login", loginLimiter, validate(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.getMe);
router.patch("/profile", authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
