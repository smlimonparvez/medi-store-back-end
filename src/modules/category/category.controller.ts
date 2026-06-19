import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import CategoryService from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryService.getAllCategories();
  sendResponse(res, { statusCode: 200, success: true, message: "Categories retrieved.", data: categories });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.createCategory(req.body.name);
  sendResponse(res, { statusCode: 201, success: true, message: "Category created.", data: category });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.updateCategory(parseInt(req.params.id), req.body.name);
  sendResponse(res, { statusCode: 200, success: true, message: "Category updated.", data: category });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await CategoryService.deleteCategory(parseInt(req.params.id));
  sendResponse(res, { statusCode: 200, success: true, message: "Category deleted." });
});

const CategoryController = { getAllCategories, createCategory, updateCategory, deleteCategory };
export default CategoryController;
