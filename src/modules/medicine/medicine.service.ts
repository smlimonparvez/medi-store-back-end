import prisma from "../../config/prisma";
import AppError from "../../utils/AppError";

type MedicineFilters = {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  manufacturer?: string;
  page?: number;
  limit?: number;
};

type MedicinePayload = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  manufacturer?: string;
  categoryId: number;
};

const medicineInclude = {
  category: { select: { id: true, name: true } },
  seller: { select: { id: true, name: true } },
};

const getAllMedicines = async (filters: MedicineFilters) => {
  const {
    search, categoryId, minPrice, maxPrice,
    manufacturer, page = 1, limit = 12,
  } = filters;

  const where: any = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  if (manufacturer) where.manufacturer = { contains: manufacturer, mode: "insensitive" };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({
      where, skip, take: limit,
      include: medicineInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.medicine.count({ where }),
  ]);

  return {
    medicines,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getMedicineById = async (id: number) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      ...medicineInclude,
      reviews: {
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!medicine) throw new AppError("Medicine not found.", 404);
  return medicine;
};

const createMedicine = async (
  payload: MedicinePayload,
  sellerId: number
) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) throw new AppError("Category not found.", 404);

  return prisma.medicine.create({
    data: { ...payload, sellerId },
    include: medicineInclude,
  });
};

const updateMedicine = async (
  id: number,
  sellerId: number,
  isAdmin: boolean,
  payload: Partial<MedicinePayload>
) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new AppError("Medicine not found.", 404);

  if (!isAdmin && medicine.sellerId !== sellerId) {
    throw new AppError("You can only update your own medicines.", 403);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!category) throw new AppError("Category not found.", 404);
  }

  return prisma.medicine.update({
    where: { id },
    data: payload,
    include: medicineInclude,
  });
};

const deleteMedicine = async (
  id: number,
  sellerId: number,
  isAdmin: boolean
) => {
  const medicine = await prisma.medicine.findUnique({ where: { id } });
  if (!medicine) throw new AppError("Medicine not found.", 404);

  if (!isAdmin && medicine.sellerId !== sellerId) {
    throw new AppError("You can only delete your own medicines.", 403);
  }

  await prisma.medicine.delete({ where: { id } });
};

const MedicineService = {
  getAllMedicines, getMedicineById,
  createMedicine, updateMedicine, deleteMedicine,
};
export default MedicineService;
