import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import AppError from "../utils/AppError";
import prisma from "../config/prisma";

export type Role = "customer" | "seller" | "admin";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: Role };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.medistore_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("You are not logged in. Please login first.", 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: number;
      email: string;
      role: Role;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new AppError("User no longer exists.", 401);
    }
    if (user.status === "banned") {
      throw new AppError(
        "Your account has been banned. Please contact support.",
        403,
      );
    }

    req.user = { id: user.id, email: user.email, role: user.role as Role };
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }
    next();
  };
};
