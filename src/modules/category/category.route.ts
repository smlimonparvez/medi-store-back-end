import { Router } from "express";
import CategoryController from "./category.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import validate from "../../utils/validate";
import { categorySchema } from "../../utils/schemas";

const router = Router();

router.get("/", CategoryController.getAllCategories);

router.post("/", authenticate, authorize("admin"), validate(categorySchema), CategoryController.createCategory);
router.put("/:id", authenticate, authorize("admin"), validate(categorySchema), CategoryController.updateCategory);
router.delete("/:id", authenticate, authorize("admin"), CategoryController.deleteCategory);

export default router;
