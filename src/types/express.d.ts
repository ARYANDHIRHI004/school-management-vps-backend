import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    /** Zod-parsed query (Express 5 `req.query` is read-only). */
    validatedQuery?: unknown;
    /** Zod-parsed route params when `req.params` cannot be assigned. */
    validatedParams?: unknown;
    /** Zod-parsed body mirror when needed. */
    validatedBody?: unknown;
  }
}