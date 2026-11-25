import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db/index.js";
import * as authSchema from "../db/schema/auth.js";
import { env } from "../utils/env.js";
import { ROLES } from "../utils/roles.js";
import { assertStudentPortalLogin } from "../utils/student-portal-access.js";
import { ApiError as AppApiError } from "../utils/api-error.js";
import { isDatabaseConnectionError } from "../utils/database-error.js";

export const auth = betterAuth({
  appName: "School Management",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: !env.AUTH_ALLOW_PUBLIC_SIGNUP,
  },
  trustedOrigins: env.CORS_ORIGINS,
  advanced:
    env.NODE_ENV === "development"
      ? {
          defaultCookieAttributes: {
            sameSite: "none",
            secure: false,
            httpOnly: true,
          },
        }
      : undefined,
  plugins: [
    admin({
      defaultRole: ROLES.STUDENT,
      adminRoles: [ROLES.ADMIN],
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = ctx.body?.email;
      if (typeof email !== "string" || !email) return;
      try {
        await assertStudentPortalLogin(email);
      } catch (error) {
        if (isDatabaseConnectionError(error)) {
          throw new APIError("SERVICE_UNAVAILABLE", {
            message:
              "Database is unavailable. Start PostgreSQL (npm run db:up) and ensure DATABASE_URL is correct.",
          });
        }
        if (error instanceof AppApiError) {
          throw new APIError("FORBIDDEN", { message: error.message });
        }
        if (error instanceof APIError) throw error;
        throw error;
      }
    }),
  },
});

export type AuthSession = typeof auth.$Infer.Session;