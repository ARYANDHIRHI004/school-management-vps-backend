import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
} from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { studentBifurcations, students } from "../db/schema/students.js";
import {
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createId } from "../utils/ids.js";

type AuthUser = { id: string };

export const searchBifurcations = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      studentId?: string;
      className?: string;
      section?: string;
      stream?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
    };

    const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

    const filters = [];
    if (scopedStudentId) {
      filters.push(eq(studentBifurcations.studentId, scopedStudentId));
    }
    if (query.className) {
      filters.push(eq(studentBifurcations.toClass, query.className));
    }
    if (query.section) {
      filters.push(eq(studentBifurcations.toSection, query.section));
    }
    if (query.stream) {
      filters.push(eq(studentBifurcations.toStream, query.stream));
    }
    if (query.fromDate) {
      filters.push(gte(studentBifurcations.effectiveDate, query.fromDate));
    }
    if (query.toDate) {
      filters.push(lte(studentBifurcations.effectiveDate, query.toDate));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      filters.push(
        or(
          ilike(studentBifurcations.toClass, pattern),
          ilike(studentBifurcations.toSection, pattern),
          ilike(studentBifurcations.toStream, pattern),
          ilike(studentBifurcations.fromClass, pattern),
          ilike(studentBifurcations.fromSection, pattern),
          ilike(studentBifurcations.fromStream, pattern),
          ilike(studentBifurcations.reason, pattern),
        )!,
      );
    }

    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(studentBifurcations)
      .where(where);

    const rows = await db
      .select({
        bifurcation: studentBifurcations,
        student: {
          id: students.id,
          firstName: students.firstName,
          lastName: students.lastName,
          admissionNumber: students.admissionNumber,
          registrationNumber: students.registrationNumber,
          rollNumber: students.rollNumber,
        },
      })
      .from(studentBifurcations)
      .innerJoin(students, eq(studentBifurcations.studentId, students.id))
      .where(where)
      .orderBy(desc(studentBifurcations.effectiveDate))
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

export const createBifurcation = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const body = req.body as {
    studentId: string;
    fromClass?: string;
    fromSection?: string;
    fromStream?: string;
    toClass: string;
    toSection?: string;
    toStream?: string;
    effectiveDate: string;
    reason?: string;
  };

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, body.studentId))
    .limit(1);

  if (!student) throw new ApiError(404, "Student not found");

  const fromClass = body.fromClass ?? student.className;
  const fromSection = body.fromSection ?? student.section;
  const fromStream = body.fromStream ?? student.stream;

  const id = createId();

  await db.transaction(async (tx) => {
    await tx.insert(studentBifurcations).values({
      id,
      studentId: body.studentId,
      fromClass,
      fromSection,
      fromStream,
      toClass: body.toClass,
      toSection: body.toSection,
      toStream: body.toStream,
      effectiveDate: body.effectiveDate,
      reason: body.reason,
      recordedByUserId: user.id,
    });

    await tx
      .update(students)
      .set({
        className: body.toClass,
        section: body.toSection ?? student.section,
        stream: body.toStream ?? student.stream,
      })
      .where(eq(students.id, body.studentId));
  });

  const [row] = await db
    .select()
    .from(studentBifurcations)
    .where(eq(studentBifurcations.id, id));

  res.status(201).json({ success: true, data: row });
});