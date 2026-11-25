import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  studentInquiries,
  studentRegistrations,
  students,
} from "../db/schema/students.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createId } from "../utils/ids.js";
import {
  getParamId,
  getValidatedBody,
  getValidatedQuery,
} from "../utils/request.js";
import {
  fetchRegistrationWithRelations,
  registrationWithRelationsSelect,
  toRegistrationDto,
  type RegistrationWithRelationsRow,
} from "../utils/registration-enrichment.js";

type AuthUser = { id: string };

export const listRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      page: number;
      limit: number;
      status?: "pending" | "approved" | "rejected";
      studentId?: string;
      search?: string;
    }>(req);

    const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

    const filters = [];
    if (scopedStudentId) {
      filters.push(eq(studentRegistrations.studentId, scopedStudentId));
    }
    if (query.status) {
      filters.push(eq(studentRegistrations.status, query.status));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      filters.push(
        or(
          ilike(studentRegistrations.registrationNumber, pattern),
          ilike(students.firstName, pattern),
          ilike(students.lastName, pattern),
          ilike(studentInquiries.inquiryNumber, pattern),
          ilike(studentInquiries.inquirerName, pattern),
        )!,
      );
    }

    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(studentRegistrations)
      .leftJoin(students, eq(studentRegistrations.studentId, students.id))
      .leftJoin(
        studentInquiries,
        eq(studentRegistrations.inquiryId, studentInquiries.id),
      )
      .where(where);

    const rows = await db
      .select(registrationWithRelationsSelect)
      .from(studentRegistrations)
      .leftJoin(students, eq(studentRegistrations.studentId, students.id))
      .leftJoin(
        studentInquiries,
        eq(studentRegistrations.inquiryId, studentInquiries.id),
      )
      .where(where)
      .orderBy(desc(studentRegistrations.createdAt))
      .limit(query.limit)
      .offset(offset);

    res.json({
      success: true,
      data: rows.map((row) =>
        toRegistrationDto(row as RegistrationWithRelationsRow),
      ),
      meta: {
        page: query.page,
        limit: query.limit,
        total: Number(totalRow?.total ?? 0),
      },
    });
  },
);

export const getRegistration = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const enriched = await fetchRegistrationWithRelations(id);
  if (!enriched) throw new ApiError(404, "Registration not found");
  await assertStudentAccess(req, enriched.studentId);

  res.json({ success: true, data: enriched });
});

export const createRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const body = getValidatedBody<{
      studentId: string;
      inquiryId?: string;
      registrationDate: string;
      remarks?: string;
    }>(req);

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, body.studentId))
      .limit(1);

    if (!student) throw new ApiError(404, "Student not found");

    const registrationNumber = createDocumentNumber("REG");
    const id = createId();

    await db.transaction(async (tx) => {
      await tx.insert(studentRegistrations).values({
        id,
        registrationNumber,
        studentId: body.studentId,
        inquiryId: body.inquiryId,
        registrationDate: body.registrationDate,
        status: "pending",
        remarks: body.remarks,
        registeredByUserId: user.id,
      });

      await tx
        .update(students)
        .set({
          lifecycleStatus: "registered",
          registrationNumber,
        })
        .where(eq(students.id, body.studentId));
    });

    const enriched = await fetchRegistrationWithRelations(id);
    res.status(201).json({ success: true, data: enriched });
  },
);

export const updateRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const body = getValidatedBody<{
      status?: "pending" | "approved" | "rejected";
      remarks?: string;
      registrationDate?: string;
    }>(req);

    const [existing] = await db
      .select()
      .from(studentRegistrations)
      .where(eq(studentRegistrations.id, id))
      .limit(1);

    if (!existing) throw new ApiError(404, "Registration not found");

    await db
      .update(studentRegistrations)
      .set({
        status: body.status ?? existing.status,
        remarks: body.remarks ?? existing.remarks,
        registrationDate: body.registrationDate ?? existing.registrationDate,
      })
      .where(eq(studentRegistrations.id, id));

    const enriched = await fetchRegistrationWithRelations(id);
    res.json({ success: true, data: enriched });
  },
);