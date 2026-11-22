import type { Request } from "express";
import { ApiError } from "./api-error.js";

export function getParamId(req: Request, key = "id"): string {
  const value = req.params[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, `Invalid route parameter: ${key}`);
  }
  return value;
}