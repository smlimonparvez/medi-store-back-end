import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import config from "../../config";
import AppError from "../../utils/AppError";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: "customer" | "seller";
  phone?: string;
};

type LoginPayload = { email: string; password: string };

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
};

const register = async (payload: RegisterPayload) => {
  const { name, email, password, role, phone } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("An account with this email already exists.", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, phone },
    select: {
      id: true, name: true, email: true,
      role: true, status: true, createdAt: true,
    },
  });

  return user;
};

const login = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("No account found with this email address.", 404);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Incorrect password. Please try again.", 401);
  }

  if (user.status === "banned") {
    throw new AppError(
      "Your account has been banned. Please contact support.",
      403
    );
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );

  const { password: _p, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true,
      status: true, phone: true, address: true,
      avatar: true, createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

const updateProfile = async (
  userId: number,
  payload: UpdateProfilePayload
) => {
  // Build update object — only include fields that were sent
  const data: Record<string, string | undefined> = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.phone !== undefined) data.phone = payload.phone || undefined;
  if (payload.address !== undefined) data.address = payload.address || undefined;
  if (payload.avatar !== undefined) data.avatar = payload.avatar || undefined;

  if (Object.keys(data).length === 0) {
    throw new AppError("No fields provided to update.", 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      status: true, phone: true, address: true, avatar: true,
    },
  });
  return user;
};

const AuthService = { register, login, getMe, updateProfile };
export default AuthService;
