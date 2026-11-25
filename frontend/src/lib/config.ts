export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Must match backend AUTH_ALLOW_PUBLIC_SIGNUP when using public sign-up form. */
export const authPublicSignUpEnabled =
  process.env.NEXT_PUBLIC_AUTH_SIGNUP_ENABLED === "true";