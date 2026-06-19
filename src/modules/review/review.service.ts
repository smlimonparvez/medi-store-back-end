import prisma from "../../config/prisma";
import AppError from "../../utils/AppError";

type CreateReviewPayload = {
  customerId: number;
  medicineId: number;
  rating: number;
  comment?: string;
};

const createReview = async (payload: CreateReviewPayload) => {
  const { customerId, medicineId, rating, comment } = payload;

  // Medicine must exist
  const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
  if (!medicine) throw new AppError("Medicine not found.", 404);

  // Customer must have a delivered order containing this medicine
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      medicineId,
      order: { customerId, status: "delivered" },
    },
  });

  if (!orderItem) {
    throw new AppError(
      "You can only review medicines from your delivered orders.",
      403
    );
  }

  // Prevent duplicate review
  const existing = await prisma.review.findFirst({
    where: { customerId, medicineId },
  });
  if (existing) throw new AppError("You have already reviewed this medicine.", 400);

  const review = await prisma.review.create({
    data: { customerId, medicineId, rating, comment },
    include: {
      customer: { select: { id: true, name: true, avatar: true } },
    },
  });

  return review;
};

const getReviewsByMedicine = async (medicineId: number) => {
  const reviews = await prisma.review.findMany({
    where: { medicineId },
    include: {
      customer: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
};

const ReviewService = { createReview, getReviewsByMedicine };
export default ReviewService;
