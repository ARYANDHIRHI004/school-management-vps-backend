import { eq } from "drizzle-orm";
import type { Request } from "express";
import { db } from "../db/index.js";
import { students } from "../db/schema/students.js";
import { ApiError } from "./api-error.js";
import { isAdminRole } from "./roles.js";

type AuthUser = {
  id: string;
  role?: string | null;
};

function authUser(req: Request): AuthUser {
  const user = req.user as AuthUser | null | undefined;
  if (!user?.id) {
    throw new ApiError(401, "Authentication required");
  }
  return user;
}

export async function getStudentRowForUser(userId: string) {
  const [row] = await db
    .select()
    .from(students)
    .where(eq(students.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function assertStudentAccess(req: Request, studentId: string) {
  const user = authUser(req);
  if (isAdminRole(user.role)) return;
  const ownStudent = await getStudentRowForUser(user.id);
  if (!ownStudent || ownStudent.id !== studentId) {
    throw new ApiError(403, "You do not have access to this student record");
  }
}

export async function resolveScopedStudentId(req: Request, queryStudentId?: string) {
  const user = authUser(req);
  if (isAdminRole(user.role)) {
    return queryStudentId;
  }
  const ownStudent = await getStudentRowForUser(user.id);
  if (!ownStudent) {
    throw new ApiError(403, "No student profile linked to your account");
  }
  if (queryStudentId && queryStudentId !== ownStudent.id) {
    throw new ApiError(403, "You can only access your own student records");
  }
  return ownStudent.id;
}