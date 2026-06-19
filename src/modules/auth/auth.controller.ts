import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AuthService from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);
  sendResponse(res, {
    statusCode: 201, success: true,
    message: "Registration successful! Please login.",
    data: user,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Login successful!",
    data: result,
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
  sendResponse(res, {
    statusCode: 200, success: true,
    message: "Profile updated successfully.",
    data: user,
  });
});

const AuthController = { register, login, getMe, updateProfile };
export default AuthController;
