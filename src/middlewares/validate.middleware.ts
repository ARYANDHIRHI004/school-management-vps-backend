import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error.js";

type RequestPart = "body" | "query" | "params";

type ValidationSchemas = Partial<Record<RequestPart, ZodType>>;

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const [part, schema] of Object.entries(schemas) as [
      RequestPart,
      ZodType,
    ][]) {
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        return next(
          new ApiError(400, "Validation failed", result.error.flatten()),
        );
      }
      req[part] = result.data;
    }
    next();
  };
}