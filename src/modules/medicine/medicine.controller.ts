import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import MedicineService from "./medicine.service";
import { getQueryString } from "../../utils/types";

const getAllMedicines = catchAsync(async (req: Request, res: Response) => {
  const { search, categoryId, minPrice, maxPrice, manufacturer, page, limit } = req.query;

  const result = await MedicineService.getAllMedicines({
    search: getQueryString(search),
    categoryId: categoryId ? parseInt(getQueryString(categoryId)!) : undefined,
    minPrice: minPrice ? parseFloat(getQueryString(minPrice)!) : undefined,
    maxPrice: maxPrice ? parseFloat(getQueryString(maxPrice)!) : undefined,
    manufacturer: getQueryString(manufacturer),
    page: page ? parseInt(getQueryString(page)!) : 1,
    limit: limit ? parseInt(getQueryString(limit)!) : 12,
  });

  sendResponse(res, { statusCode: 200, success: true, message: "Medicines retrieved.", data: result });
});

const getMedicineById = catchAsync(async (req: Request, res: Response) => {
  const medicine = await MedicineService.getMedicineById(parseInt(getQueryString(req.params.id)!));
  sendResponse(res, { statusCode: 200, success: true, message: "Medicine retrieved.", data: medicine });
});

const createMedicine = catchAsync(async (req: Request, res: Response) => {
  const medicine = await MedicineService.createMedicine(req.body, req.user!.id);
  sendResponse(res, { statusCode: 201, success: true, message: "Medicine added successfully.", data: medicine });
});

const updateMedicine = catchAsync(async (req: Request, res: Response) => {
  const medicine = await MedicineService.updateMedicine(
    parseInt(getQueryString(req.params.id)!),
    req.user!.id,
    req.user!.role === "admin",
    req.body
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Medicine updated.", data: medicine });
});

const deleteMedicine = catchAsync(async (req: Request, res: Response) => {
  await MedicineService.deleteMedicine(
    parseInt(getQueryString(req.params.id)!),
    req.user!.id,
    req.user!.role === "admin"
  );
  sendResponse(res, { statusCode: 200, success: true, message: "Medicine deleted." });
});

const MedicineController = {
  getAllMedicines, getMedicineById,
  createMedicine, updateMedicine, deleteMedicine,
};
export default MedicineController;
