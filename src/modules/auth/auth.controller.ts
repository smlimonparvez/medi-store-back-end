import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AuthService from "./auth.service";
import config from "../../config";

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);
  sendResponse(res, {
    statusCode: 201, success: true,
    message: "Registration successful! Please login.",
    data: user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await AuthService.login(req.body);

  // ── HttpOnly cookie — JS cannot read this ────────────────────────────────
  res.cookie("medistore_token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: config.cookieMaxAge,
  });

  // ── User info cookie — readable by Next.js middleware for route protection
  // Does NOT contain sensitive data (no password, no token)
  res.cookie("medistore_user", JSON.stringify(user), {
    httpOnly: false,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: config.cookieMaxAge,
  });

  // Return user in body — frontend uses this to update UI state
  // Token is NOT returned in body anymore
  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Login successful!",
    data: { user },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear both cookies
  res.clearCookie("medistore_token", { httpOnly: true, sameSite: "lax" });
  res.clearCookie("medistore_user",  { httpOnly: false, sameSite: "lax" });

  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Logged out successfully.",
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.getMe(req.user!.id);
  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Profile retrieved successfully.",
    data: user,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.updateProfile(req.user!.id, req.body);

  // Refresh the user cookie with updated data
  res.cookie("medistore_user", JSON.stringify(user), {
    httpOnly: false,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: config.cookieMaxAge,
  });

  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Profile updated successfully.",
    data: user,
  });
});

const AuthController = { register, login, logout, getMe, updateProfile };
export default AuthController;
