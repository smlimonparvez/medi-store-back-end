import prisma from "../../config/prisma";
import AppError from "../../utils/AppError";

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const createCategory = async (name: string) => {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError("A category with this name already exists.", 400);
  }

  return prisma.category.create({ data: { name, slug } });
};

const updateCategory = async (id: number, name: string) => {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  // Check slug is not taken by a DIFFERENT category
  const existing = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    throw new AppError("A category with this name already exists.", 400);
  }

  return prisma.category.update({ where: { id }, data: { name, slug } });
};

const deleteCategory = async (id: number) => {
  const medicineCount = await prisma.medicine.count({ where: { categoryId: id } });
  if (medicineCount > 0) {
    throw new AppError(
      `Cannot delete — ${medicineCount} medicine(s) are assigned to this category.`,
      400
    );
  }
  await prisma.category.delete({ where: { id } });
};

const CategoryService = {
  getAllCategories, createCategory, updateCategory, deleteCategory,
};
export default CategoryService;
