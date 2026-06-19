import prisma from "../../config/prisma";
import AppError from "../../utils/AppError";

type OrderItemInput = { medicineId: number; quantity: number };

type CreateOrderPayload = {
  customerId: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  notes?: string;
  items: OrderItemInput[];
};

const orderInclude = {
  orderItems: {
    include: {
      medicine: {
        select: { id: true, name: true, image: true, price: true, sellerId: true },
      },
    },
  },
};

const createOrder = async (payload: CreateOrderPayload) => {
  const { customerId, shippingAddress, shippingCity, shippingPhone, notes, items } = payload;

  // Validate all medicines and stock in one pass
  let totalAmount = 0;

  type ItemData = {
    medicineId: number;
    quantity: number;
    unitPrice: number;
  };

  const itemsData: ItemData[] = [];

  for (const item of items) {
    const medicine = await prisma.medicine.findUnique({ where: { id: item.medicineId } });

    if (!medicine) {
      throw new AppError(`Medicine with ID ${item.medicineId} not found.`, 404);
    }
    if (medicine.stock < item.quantity) {
      throw new AppError(
        `Not enough stock for "${medicine.name}". Only ${medicine.stock} unit(s) available.`,
        400
      );
    }

    const unitPrice = Number(medicine.price);
    totalAmount += unitPrice * item.quantity;
    itemsData.push({ medicineId: item.medicineId, quantity: item.quantity, unitPrice });
  }

  // Transaction: create order + deduct stock atomically
  const order = await prisma.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        customerId, totalAmount, shippingAddress,
        shippingCity, shippingPhone, notes,
        orderItems: {
          create: itemsData.map((i) => ({
            medicineId: i.medicineId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: orderInclude,
    });

    for (const item of itemsData) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  return order;
};

const getMyOrders = async (customerId: number) => {
  return prisma.order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const getOrderById = async (
  orderId: number,
  userId: number,
  role: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      ...orderInclude,
    },
  });

  if (!order) throw new AppError("Order not found.", 404);

  // Customers can only see their own orders
  if (role === "customer" && order.customerId !== userId) {
    throw new AppError("You are not allowed to view this order.", 403);
  }

  // Sellers can only see orders containing their medicines
  if (role === "seller") {
    const hasItem = order.orderItems.some(
      (item: any) => item.medicine.sellerId === userId
    );
    if (!hasItem) throw new AppError("You are not allowed to view this order.", 403);
  }

  return order;
};

const cancelOrder = async (orderId: number, customerId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new AppError("Order not found.", 404);
  if (order.customerId !== customerId) {
    throw new AppError("You can only cancel your own orders.", 403);
  }
  if (order.status !== "placed") {
    throw new AppError(
      `Cannot cancel — order is already "${order.status}". Only 'placed' orders can be cancelled.`,
      400
    );
  }

  // Restore stock when order is cancelled
  const orderItems = await prisma.orderItem.findMany({ where: { orderId } });

  return prisma.$transaction(async (tx: any) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
      include: orderInclude,
    });

    for (const item of orderItems) {
      await tx.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return updated;
  });
};

const getAllOrders = async (page = 1, limit = 15) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip, take: limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: { medicine: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
  ]);

  return {
    orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const OrderService = {
  createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders,
};
export default OrderService;
