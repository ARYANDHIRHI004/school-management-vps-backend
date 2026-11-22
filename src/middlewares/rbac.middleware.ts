import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { isAdminRole, ROLES } from "../utils/roles.js";

type AuthUser = {
  id: string;
  role?: string | null;
};

function getAuthUser(req: Request): AuthUser | null {
  const user = req.user as AuthUser | null | undefined;
  if (!user?.id) return null;
  return user;
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return next(new ApiError(401, "Authentication required"));
  }
  if (!isAdminRole(user.role)) {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
}

export function requireStudent(req: Request, _res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return next(new ApiError(401, "Authentication required"));
  }
  const role = user.role ?? "";
  if (!role.split(",").map((r) => r.trim()).includes(ROLES.STUDENT)) {
    return next(new ApiError(403, "Student access required"));
  }
  next();
}