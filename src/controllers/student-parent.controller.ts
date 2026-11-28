import { and, eq, isNull } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { studentParents, students } from "../db/schema/students.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createId } from "../utils/ids.js";
import { getParamId, getValidatedBody } from "../utils/request.js";

async function assertStudentExists(studentId: string) {
  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(and(eq(students.id, studentId), isNull(students.deletedAt)))
    .limit(1);
  if (!student) throw new ApiError(404, "Student not found");
}

export const listStudentParents = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = getParamId(req);
    await assertStudentExists(studentId);

    const rows = await db
      .select()
      .from(studentParents)
      .where(eq(studentParents.studentId, studentId));

    res.json({ success: true, data: rows });
  },
);

export const createStudentParent = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = getParamId(req);
    await assertStudentExists(studentId);

    const body = getValidatedBody<{
      relationship: "father" | "mother" | "guardian" | "other";
      firstName: string;
      middleName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      occupation?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isPrimaryContact?: boolean;
    }>(req);

    const id = createId();

    const [row] = await db
      .insert(studentParents)
      .values({
        id,
        studentId,
        relationship: body.relationship,
        firstName: body.firstName,
        middleName: body.middleName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        occupation: body.occupation,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
        isPrimaryContact: body.isPrimaryContact ?? false,
      })
      .returning();

    res.status(201).json({ success: true, data: row });
  },
);

export const updateStudentParent = asyncHandler(
  async (req: Request, res: Response) => {
    const parentId = getParamId(req, "parentId");

    const body = getValidatedBody<Partial<{
      relationship: "father" | "mother" | "guardian" | "other";
      firstName: string;
      middleName: string;
      lastName: string;
      email: string;
      phone: string;
      occupation: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isPrimaryContact: boolean;
    }>>(req);

    const [existing] = await db
      .select()
      .from(studentParents)
      .where(eq(studentParents.id, parentId))
      .limit(1);

    if (!existing) throw new ApiError(404, "Parent record not found");

    const [row] = await db
      .update(studentParents)
      .set({
        relationship: body.relationship ?? existing.relationship,
        firstName: body.firstName ?? existing.firstName,
        middleName: body.middleName ?? existing.middleName,
        lastName: body.lastName ?? existing.lastName,
        email: body.email ?? existing.email,
        phone: body.phone ?? existing.phone,
        occupation: body.occupation ?? existing.occupation,
        addressLine1: body.addressLine1 ?? existing.addressLine1,
        addressLine2: body.addressLine2 ?? existing.addressLine2,
        city: body.city ?? existing.city,
        state: body.state ?? existing.state,
        postalCode: body.postalCode ?? existing.postalCode,
        country: body.country ?? existing.country,
        isPrimaryContact: body.isPrimaryContact ?? existing.isPrimaryContact,
      })
      .where(eq(studentParents.id, parentId))
      .returning();

    res.json({ success: true, data: row });
  },
);

export const deleteStudentParent = asyncHandler(
  async (req: Request, res: Response) => {
    const parentId = getParamId(req, "parentId");

    const [existing] = await db
      .select({ id: studentParents.id })
      .from(studentParents)
      .where(eq(studentParents.id, parentId))
      .limit(1);

    if (!existing) throw new ApiError(404, "Parent record not found");

    await db.delete(studentParents).where(eq(studentParents.id, parentId));

    res.json({ success: true, data: { id: parentId } });
  },
);