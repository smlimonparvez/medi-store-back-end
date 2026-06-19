import { Router } from "express";
import SellerController from "./seller.controller";
import MedicineController from "../medicine/medicine.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import {
  createMedicineSchema,
  updateMedicineSchema,
  updateOrderStatusSchema,
} from "../../utils/schemas";

const router = Router();

// All seller routes require seller role
router.use(authenticate, authorize("seller"));

// Dashboard
router.get("/dashboard", SellerController.getSellerStats);

// Medicines — GET single must be before any wildcard
router.get("/medicines", SellerController.getMyMedicines);
router.get("/medicines/:id", SellerController.getMyMedicineById);
router.post("/medicines", validate(createMedicineSchema), MedicineController.createMedicine);
router.put("/medicines/:id", validate(updateMedicineSchema), MedicineController.updateMedicine);
router.delete("/medicines/:id", MedicineController.deleteMedicine);

// Orders
router.get("/orders", SellerController.getMyOrders);
router.patch(
  "/orders/:id",
  validate(updateOrderStatusSchema),
  SellerController.updateOrderStatus
);

export default router;
