import { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";

  // Prisma: unique constraint violation
  if (err.code === "P2002") {
    statusCode = 400;
    message = `This ${err.meta?.target?.[0] || "field"} is already in use.`;
  }

  // Prisma: record not found
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  }

  // Prisma: foreign key constraint
  if (err.code === "P2003") {
    statusCode = 400;
    message = "Related record not found. Check your input.";
  }

  // JWT invalid
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please login again.";
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please login again.";
  }

  // Log in dev only
  if (process.env.NODE_ENV === "development") {
    console.error(`[${req.method}] ${req.path} →`, err);
  }

  return res.status(statusCode).json({ success: false, message });
};

export default globalErrorHandler;
