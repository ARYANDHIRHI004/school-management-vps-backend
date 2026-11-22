import { and, count, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { studentRegistrations, students } from "../db/schema/students.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createId } from "../utils/ids.js";
import { getParamId } from "../utils/request.js";

type AuthUser = { id: string };

export const listRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      status?: "pending" | "approved" | "rejected";
      studentId?: string;
    };

    const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

    const filters = [];
    if (scopedStudentId) {
      filters.push(eq(studentRegistrations.studentId, scopedStudentId));
    }
    if (query.status) {
      filters.push(eq(studentRegistrations.status, query.status));
    }

    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(studentRegistrations)
      .where(where);

    const rows = await db
      .select()
      .from(studentRegistrations)
      .where(where)
      .orderBy(desc(studentRegistrations.createdAt))
      .limit(query.limit)
      .offset(offset);

    res.json({
      success: true,
      data: rows,
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
  const [row] = await db
    .select()
    .from(studentRegistrations)
    .where(eq(studentRegistrations.id, id))
    .limit(1);

  if (!row) throw new ApiError(404, "Registration not found");
  await assertStudentAccess(req, row.studentId);

  res.json({ success: true, data: row });
});

export const createRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const body = req.body as {
      studentId: string;
      inquiryId?: string;
      registrationDate: string;
      remarks?: string;
    };

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

    const [row] = await db
      .select()
      .from(studentRegistrations)
      .where(eq(studentRegistrations.id, id));

    res.status(201).json({ success: true, data: row });
  },
);

export const updateRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const body = req.body as {
      status?: "pending" | "approved" | "rejected";
      remarks?: string;
      registrationDate?: string;
    };

    const [existing] = await db
      .select()
      .from(studentRegistrations)
      .where(eq(studentRegistrations.id, id))
      .limit(1);

    if (!existing) throw new ApiError(404, "Registration not found");

    const [updated] = await db
      .update(studentRegistrations)
      .set({
        status: body.status ?? existing.status,
        remarks: body.remarks ?? existing.remarks,
        registrationDate: body.registrationDate ?? existing.registrationDate,
      })
      .where(eq(studentRegistrations.id, id))
      .returning();

    res.json({ success: true, data: updated });
  },
);