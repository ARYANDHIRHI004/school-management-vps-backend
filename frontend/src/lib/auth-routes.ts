export function dashboardPathForRole(role: string | null | undefined): string {
  return role === "admin" ? "/dashboard" : "/dashboard";
}

export async function redirectAfterAuth(
  router: { push: (path: string) => void; refresh: () => void },
  role?: string | null,
) {
  router.push(dashboardPathForRole(role));
  router.refresh();
}