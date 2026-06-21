import prisma from "../../config/prisma";
import AppError from "../../utils/AppError";
import { UserStatus } from "../../utils/types";
const getAllUsers = async (page = 1, limit = 10, role?: string) => {
  const skip = (page - 1) * limit;

  const where: any = { role: { not: "admin" } };
  if (role && role !== "all") where.role = role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const updateUserStatus = async (userId: number, status: UserStatus) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found.", 404);
  if (user.role === "admin") throw new AppError("Cannot change admin status.", 400);

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getDashboardStats = async () => {
  const [
    totalCustomers,
    totalSellers,
    totalMedicines,
    totalOrders,
    pendingOrders,
    deliveredOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "seller" } }),
    prisma.medicine.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "placed" } }),
    prisma.order.count({ where: { status: "delivered" } }),
  ]);

  return {
    totalUsers: totalCustomers + totalSellers,
    totalCustomers,
    totalSellers,
    totalMedicines,
    totalOrders,
    pendingOrders,
    deliveredOrders,
  };
};

const AdminService = { getAllUsers, updateUserStatus, getDashboardStats };
export default AdminService;
