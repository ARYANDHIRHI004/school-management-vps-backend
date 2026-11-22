export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export function parseUserRoles(role?: string | null): AppRole[] {
  if (!role) return [];
  return role
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is AppRole =>
      value === ROLES.ADMIN || value === ROLES.STUDENT,
    );
}

export function isAdminRole(role?: string | null): boolean {
  return parseUserRoles(role).includes(ROLES.ADMIN);
}

export function isStudentRole(role?: string | null): boolean {
  return parseUserRoles(role).includes(ROLES.STUDENT);
}