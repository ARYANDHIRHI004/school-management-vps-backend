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
      if (part === "query") {
        req.validatedQuery = result.data;
      } else if (part === "params") {
        req.validatedParams = result.data;
      } else {
        req.validatedBody = result.data;
        try {
          req.body = result.data;
        } catch {
          /* Express 5+ may expose read-only `body` on some setups */
        }
      }
    }
    next();
  };
}