import { dashboardPathForRole, type PortalIntent } from "@/lib/roles";

export type { PortalIntent };
export { dashboardPathForRole };

export async function redirectAfterAuth(
  router: { push: (path: string) => void; refresh: () => void },
  role?: string | null,
) {
  router.push(dashboardPathForRole(role));
  router.refresh();
}