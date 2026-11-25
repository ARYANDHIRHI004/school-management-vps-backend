import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  studentAdmissions,
  studentRegistrations,
  students,
} from "../db/schema/students.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {
  fetchAdmissionWithRelations,
  admissionWithRelationsSelect,
  toAdmissionDto,
  type AdmissionWithRelationsRow,
} from "../utils/admission-enrichment.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createId } from "../utils/ids.js";
import {
  getParamId,
  getValidatedBody,
  getValidatedQuery,
} from "../utils/request.js";
import { assertApprovedRegistration } from "../utils/student-portal-access.js";
import { provisionStudentPortalLogin } from "../utils/student-portal-provision.js";

type AuthUser = { id: string };

export const listAdmissions = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{
    page: number;
    limit: number;
    status?: "active" | "completed" | "cancelled";
    studentId?: string;
    search?: string;
  }>(req);

  const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

  const filters = [];
  if (scopedStudentId) {
    filters.push(eq(studentAdmissions.studentId, scopedStudentId));
  }
  if (query.status) {
    filters.push(eq(studentAdmissions.status, query.status));
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    filters.push(
      or(
        ilike(studentAdmissions.admissionNumber, pattern),
        ilike(students.firstName, pattern),
        ilike(students.lastName, pattern),
        ilike(studentAdmissions.className, pattern),
        ilike(studentRegistrations.registrationNumber, pattern),
      )!,
    );
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(studentAdmissions)
    .leftJoin(students, eq(studentAdmissions.studentId, students.id))
    .leftJoin(
      studentRegistrations,
      eq(studentAdmissions.registrationId, studentRegistrations.id),
    )
    .where(where);

  const rows = await db
    .select(admissionWithRelationsSelect)
    .from(studentAdmissions)
    .leftJoin(students, eq(studentAdmissions.studentId, students.id))
    .leftJoin(
      studentRegistrations,
      eq(studentAdmissions.registrationId, studentRegistrations.id),
    )
    .where(where)
    .orderBy(desc(studentAdmissions.createdAt))
    .limit(query.limit)
    .offset(offset);

  res.json({
    success: true,
    data: rows.map((row) => toAdmissionDto(row as AdmissionWithRelationsRow)),
    meta: {
      page: query.page,
      limit: query.limit,
      total: Number(totalRow?.total ?? 0),
    },
  });
});

export const getAdmission = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const enriched = await fetchAdmissionWithRelations(id);
  if (!enriched) throw new ApiError(404, "Admission not found");
  await assertStudentAccess(req, enriched.studentId);

  res.json({ success: true, data: enriched });
});

export const createAdmission = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const body = getValidatedBody<{
    studentId: string;
    registrationId?: string;
    admissionDate: string;
    admissionNumber?: string;
    className: string;
    section?: string;
    stream?: string;
    academicYear?: string;
    portalAccess?: { email: string; password: string; name?: string };
  }>(req);

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, body.studentId))
    .limit(1);

  if (!student) throw new ApiError(404, "Student not found");

  if (student.lifecycleStatus === "admitted") {
    throw new ApiError(400, "Student is already admitted");
  }

  await assertApprovedRegistration(body.studentId);

  const admissionNumber = body.admissionNumber ?? createDocumentNumber("ADM");
  const id = createId();

  await db.transaction(async (tx) => {
    await tx.insert(studentAdmissions).values({
      id,
      admissionNumber,
      studentId: body.studentId,
      registrationId: body.registrationId,
      admissionDate: body.admissionDate,
      className: body.className,
      section: body.section,
      stream: body.stream,
      academicYear: body.academicYear,
      status: "active",
      admittedByUserId: user.id,
    });

    await tx
      .update(students)
      .set({
        lifecycleStatus: "admitted",
        admissionNumber,
        className: body.className,
        section: body.section,
        stream: body.stream,
        academicYear: body.academicYear ?? student.academicYear,
      })
      .where(eq(students.id, body.studentId));
  });

  let portal:
    | Awaited<ReturnType<typeof provisionStudentPortalLogin>>
    | undefined;
  if (body.portalAccess) {
    portal = await provisionStudentPortalLogin(req, body.studentId, {
      email: body.portalAccess.email,
      password: body.portalAccess.password,
      name:
        body.portalAccess.name ??
        `${student.firstName} ${student.lastName}`.trim(),
    });
  }

  const enriched = await fetchAdmissionWithRelations(id);

  res.status(201).json({
    success: true,
    data: {
      admission: enriched,
      portal: portal
        ? { userId: portal.user.id, email: portal.user.email }
        : null,
    },
  });
});

export const updateAdmission = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const body = getValidatedBody<{
    status?: "active" | "completed" | "cancelled";
    className?: string;
    section?: string;
    stream?: string;
    academicYear?: string;
  }>(req);

  const [existing] = await db
    .select()
    .from(studentAdmissions)
    .where(eq(studentAdmissions.id, id))
    .limit(1);

  if (!existing) throw new ApiError(404, "Admission not found");

  await db
    .update(studentAdmissions)
    .set({
      status: body.status ?? existing.status,
      className: body.className ?? existing.className,
      section: body.section ?? existing.section,
      stream: body.stream ?? existing.stream,
      academicYear: body.academicYear ?? existing.academicYear,
    })
    .where(eq(studentAdmissions.id, id));

  if (body.className || body.section || body.stream || body.academicYear) {
    const [updated] = await db
      .select()
      .from(studentAdmissions)
      .where(eq(studentAdmissions.id, id))
      .limit(1);

    if (updated) {
      await db
        .update(students)
        .set({
          className: updated.className,
          section: updated.section,
          stream: updated.stream,
          academicYear: updated.academicYear ?? undefined,
        })
        .where(eq(students.id, existing.studentId));
    }
  }

  const enriched = await fetchAdmissionWithRelations(id);
  res.json({ success: true, data: enriched });
});