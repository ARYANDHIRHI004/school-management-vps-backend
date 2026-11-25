import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { apiBaseUrl } from "./config";

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [adminClient()],
});