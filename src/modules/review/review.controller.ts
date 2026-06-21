import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import ReviewService from "./review.service";
import { getQueryString } from "../../utils/types";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const review = await ReviewService.createReview({
    ...req.body,
    customerId: req.user!.id,
  });
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully.",
    data: review,
  });
});

const getReviewsByMedicine = catchAsync(async (req: Request, res: Response) => {
  const medicineId = parseInt(getQueryString(req.params.medicineId)!);
  if (isNaN(medicineId)) {
    return sendResponse(res, { statusCode: 400, success: false, message: "Invalid medicine ID." });
  }
  const reviews = await ReviewService.getReviewsByMedicine(medicineId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved.",
    data: reviews,
  });
});

const ReviewController = { createReview, getReviewsByMedicine };
export default ReviewController;
