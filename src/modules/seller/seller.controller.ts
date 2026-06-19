import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import SellerService from "./seller.service";
const getSellerStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await SellerService.getSellerStats(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Stats retrieved.", data: stats });
});

const getMyMedicines = catchAsync(async (req: Request, res: Response) => {
  const medicines = await SellerService.getMyMedicines(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Medicines retrieved.", data: medicines });
});

// NEW: single medicine for edit form pre-fill
const getMyMedicineById = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return sendResponse(res, { statusCode: 400, success: false, message: "Invalid ID." });
  const medicine = await SellerService.getMyMedicineById(id, req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Medicine retrieved.", data: medicine });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const result = await SellerService.getMyOrders(req.user!.id, page, limit);
  sendResponse(res, { statusCode: 200, success: true, message: "Orders retrieved.", data: result });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) return sendResponse(res, { statusCode: 400, success: false, message: "Invalid order ID." });
  const { status } = req.body;
  const order = await SellerService.updateOrderStatus(orderId, req.user!.id, status as string);
  sendResponse(res, { statusCode: 200, success: true, message: "Order status updated.", data: order });
});

const SellerController = {
  getSellerStats,
  getMyMedicines,
  getMyMedicineById,
  getMyOrders,
  updateOrderStatus,
};
export default SellerController;
