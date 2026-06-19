import { Router } from "express";
import ReviewController from "./review.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { createReviewSchema } from "../../utils/schemas";

const router = Router();

// Public — anyone can read reviews
router.get("/medicine/:medicineId", ReviewController.getReviewsByMedicine);

// Customer only — submit a review
router.post(
  "/",
  authenticate,
  authorize("customer"),
  validate(createReviewSchema),
  ReviewController.createReview
);

export default router;
