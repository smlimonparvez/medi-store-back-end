import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AdminService from "./admin.service";
import OrderService from "../order/order.service";
import { getQueryString, UserStatus } from "../../utils/types";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AdminService.getDashboardStats();
  sendResponse(res, { statusCode: 200, success: true, message: "Stats retrieved.", data: stats });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(getQueryString(req.query.page)!) : 1;
  const limit = req.query.limit ? parseInt(getQueryString(req.query.limit)!) : 10;
  const role = getQueryString(req.query.role);
  const result = await AdminService.getAllUsers(page, limit, role);
  sendResponse(res, { statusCode: 200, success: true, message: "Users retrieved.", data: result });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = parseInt(getQueryString(req.params.id)!);
  if (isNaN(userId)) return sendResponse(res, { statusCode: 400, success: false, message: "Invalid user ID." });
  const { status } = req.body;
  const user = await AdminService.updateUserStatus(userId, status as UserStatus);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `User ${status === "banned" ? "banned" : "unbanned"} successfully.`,
    data: user,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 15;
  const result = await OrderService.getAllOrders(page, limit);
  sendResponse(res, { statusCode: 200, success: true, message: "All orders retrieved.", data: result });
});

const AdminController = { getDashboardStats, getAllUsers, updateUserStatus, getAllOrders };
export default AdminController;
