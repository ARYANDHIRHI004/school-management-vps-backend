/** Mirrors backend `src/utils/roles.ts` + Better Auth `user` role for students. */
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  USER: "user",
} as const;

export type PortalIntent = "admin" | "student";

export function parseUserRoles(role?: string | null): string[] {
  if (!role) return [];
  return role
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function isAdminRole(role?: string | null): boolean {
  return parseUserRoles(role).includes(ROLES.ADMIN);
}

export function isStudentPortalRole(role?: string | null): boolean {
  if (isAdminRole(role)) return false;
  const roles = parseUserRoles(role);
  if (roles.length === 0) return true;
  return (
    roles.includes(ROLES.STUDENT) ||
    roles.includes(ROLES.USER) ||
    roles.every((r) => r !== ROLES.ADMIN)
  );
}

export function dashboardPathForRole(role?: string | null): string {
  return isAdminRole(role) ? "/dashboard/admin" : "/dashboard/student";
}

export function assertPortalIntentMatchesRole(
  intent: PortalIntent,
  role?: string | null,
): void {
  if (intent === "admin" && !isAdminRole(role)) {
    throw new Error(
      "This account is not an admin. Switch to Student portal or contact the school office.",
    );
  }
  if (intent === "student" && isAdminRole(role)) {
    throw new Error(
      "This account is an admin. Switch to Admin portal to sign in here.",
    );
  }
}