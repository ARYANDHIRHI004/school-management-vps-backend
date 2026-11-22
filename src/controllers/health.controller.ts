import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "School Management API is running",
    timestamp: new Date().toISOString(),
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      session: req.session,
      user: req.user,
    },
  });
});