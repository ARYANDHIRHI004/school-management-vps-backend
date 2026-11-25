import type { Request } from "express";
import { ApiError } from "./api-error.js";

/** Coerced query from `validate({ query })` middleware (Express 5-safe). */
export function getValidatedQuery<T>(req: Request): T {
  if (req.validatedQuery !== undefined) {
    return req.validatedQuery as T;
  }
  return req.query as T;
}

/** Parsed body from `validate({ body })` middleware (Express 5-safe). */
export function getValidatedBody<T>(req: Request): T {
  if (req.validatedBody !== undefined) {
    return req.validatedBody as T;
  }
  return req.body as T;
}

export function getParamId(req: Request, key = "id"): string {
  const validated = req.validatedParams as Record<string, unknown> | undefined;
  const fromValidated = validated?.[key];
  const value =
    typeof fromValidated === "string" && fromValidated.length > 0
      ? fromValidated
      : req.params[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, `Invalid route parameter: ${key}`);
  }
  return value;
}