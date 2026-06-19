import prisma from "../../config/prisma";
import AppError from "../../utils/AppError";
const getMyMedicines = async (sellerId: number) => {
  const medicines = await prisma.medicine.findMany({
    where: { sellerId },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return medicines;
};

// NEW: get a single medicine (for pre-filling the edit form)
const getMyMedicineById = async (id: number, sellerId: number) => {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!medicine) throw new AppError("Medicine not found.", 404);
  if (medicine.sellerId !== sellerId)
    throw new AppError("You can only view your own medicines.", 403);

  return medicine;
};

const getMyOrders = async (sellerId: number, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Find all order items where medicine belongs to this seller
  const orderItems = await prisma.orderItem.findMany({
    where: { medicine: { sellerId } },
    include: {
      order: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
        },
      },
      medicine: { select: { id: true, name: true, price: true } },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  // Group by order to avoid duplicate order rows
  const ordersMap = new Map<number, any>();
  for (const item of orderItems) {
    const oid = item.order.id;
    if (!ordersMap.has(oid)) {
      ordersMap.set(oid, { ...item.order, items: [] });
    }
    ordersMap.get(oid).items.push({
      id: item.id,
      medicine: item.medicine,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  }

  const allOrders = Array.from(ordersMap.values());
  const total = allOrders.length;
  const paginated = allOrders.slice(skip, skip + limit);

  return {
    orders: paginated,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const updateOrderStatus = async (
  orderId: number,
  sellerId: number,
  status: string
) => {
  // Verify this seller has a medicine in this order
  const orderItem = await prisma.orderItem.findFirst({
    where: { orderId, medicine: { sellerId } },
  });
  if (!orderItem)
    throw new AppError("You are not authorized to update this order.", 403);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found.", 404);

  // Enforce valid status transitions
  const allowed: Record<string, string[]> = {
    placed: ["processing"],
    processing: ["shipped"],
    shipped: ["delivered"],
  };

  if (!allowed[order.status]?.includes(status)) {
    throw new AppError(
      `Cannot change status from "${order.status}" to "${status}".`,
      400
    );
  }

  return prisma.order.update({ where: { id: orderId }, data: { status } });
};

const getSellerStats = async (sellerId: number) => {
  const orderItemsRaw = await prisma.orderItem.findMany({
    where: { medicine: { sellerId } },
    select: { orderId: true },
  });
  const distinctOrderCount = new Set(
    orderItemsRaw.map((i: { orderId: number }) => i.orderId)
  ).size;

  const [totalMedicines, outOfStock] = await Promise.all([
    prisma.medicine.count({ where: { sellerId } }),
    prisma.medicine.count({ where: { sellerId, stock: 0 } }),
  ]);

  return { totalMedicines, totalOrders: distinctOrderCount, outOfStock };
};

const SellerService = {
  getMyMedicines,
  getMyMedicineById,
  getMyOrders,
  updateOrderStatus,
  getSellerStats,
};
export default SellerService;
