import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import OrderService from "./order.service";
import { getQueryString } from "../../utils/types";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.createOrder({ ...req.body, customerId: req.user!.id });
  sendResponse(res, { statusCode: 201, success: true, message: "Order placed successfully.", data: order });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await OrderService.getMyOrders(req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Orders retrieved.", data: orders });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.getOrderById(
    parseInt(getQueryString(req.params.id)!), req.user!.id, req.user!.role
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Order retrieved.", data: order });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.cancelOrder(parseInt(getQueryString(req.params.id)!), req.user!.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Order cancelled.", data: order });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const page = req.query.page ? parseInt(getQueryString(req.query.page)!) : 1;
  const limit = req.query.limit ? parseInt(getQueryString(req.query.limit)!) : 15;
  const result = await OrderService.getAllOrders(page, limit);
  sendResponse(res, { statusCode: 200, success: true, message: "All orders retrieved.", data: result });
});

const OrderController = {
  createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders,
};
export default OrderController;
