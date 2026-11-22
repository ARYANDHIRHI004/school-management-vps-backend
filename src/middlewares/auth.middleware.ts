import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth, type AuthSession } from "../lib/auth.js";
import { ApiError } from "../utils/api-error.js";

type SessionUser = AuthSession["user"] & {
  role?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      session?: AuthSession | null;
      user?: SessionUser | null;
    }
  }
}

export async function attachSession(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.session = session;
    req.user = session?.user ?? null;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  next();
}