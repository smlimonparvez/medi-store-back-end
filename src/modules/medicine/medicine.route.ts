import { Router } from "express";
import MedicineController from "./medicine.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { createMedicineSchema, updateMedicineSchema } from "../../utils/schemas";

const router = Router();

// Public
router.get("/", MedicineController.getAllMedicines);
router.get("/:id", MedicineController.getMedicineById);

// Seller or Admin
router.post("/", authenticate, authorize("seller", "admin"), validate(createMedicineSchema), MedicineController.createMedicine);
router.put("/:id", authenticate, authorize("seller", "admin"), validate(updateMedicineSchema), MedicineController.updateMedicine);
router.delete("/:id", authenticate, authorize("seller", "admin"), MedicineController.deleteMedicine);

export default router;
