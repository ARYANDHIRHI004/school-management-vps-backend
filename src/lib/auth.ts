import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db/index.js";
import * as authSchema from "../db/schema/auth.js";
import { env } from "../utils/env.js";
import { ROLES } from "../utils/roles.js";

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
  },
  trustedOrigins: env.CORS_ORIGINS,
  plugins: [
    admin({
      defaultRole: ROLES.STUDENT,
      adminRoles: [ROLES.ADMIN],
    }),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;