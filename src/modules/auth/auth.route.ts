import { Router } from "express";
import AuthController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import {
  registerSchema, loginSchema, updateProfileSchema,
} from "../../utils/schemas";

const router = Router();

router.post("/register", validate(registerSchema),    AuthController.register);
router.post("/login",    validate(loginSchema),       AuthController.login);
router.post("/logout",   AuthController.logout);
router.get( "/me",       authenticate,                AuthController.getMe);
router.patch("/profile", authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
