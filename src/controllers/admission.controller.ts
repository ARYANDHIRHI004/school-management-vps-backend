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
import { createId } from "../utils/ids.js";
import { resolveClassSectionPlacement } from "../services/academic-placement.service.js";
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
    lifecycle?: "inquiry" | "registered" | "admitted" | "transferred" | "left";
  }>(req);

  const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

  const filters = [];
  if (scopedStudentId) {
    filters.push(eq(studentAdmissions.studentId, scopedStudentId));
  }
  if (query.status) {
    filters.push(eq(studentAdmissions.status, query.status));
  }
  if (query.lifecycle) {
    filters.push(eq(students.lifecycleStatus, query.lifecycle));
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
    admissionNumber: string;
    classId: string;
    sectionId: string;
    stream?: string;
    academicYear?: string;
    portalAccess?: { email: string; password: string; name?: string };
  }>(req);

  const placement = await resolveClassSectionPlacement(
    body.classId,
    body.sectionId,
  );

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

  const admissionNumber = body.admissionNumber.trim();
  const [numberTaken] = await db
    .select({ id: studentAdmissions.id })
    .from(studentAdmissions)
    .where(eq(studentAdmissions.admissionNumber, admissionNumber))
    .limit(1);
  if (numberTaken) {
    throw new ApiError(409, "Admission number is already in use");
  }

  const id = createId();

  await db.transaction(async (tx) => {
    await tx.insert(studentAdmissions).values({
      id,
      admissionNumber,
      studentId: body.studentId,
      registrationId: body.registrationId,
      admissionDate: body.admissionDate,
      className: placement.className,
      section: placement.section,
      stream: body.stream,
      academicYear: body.academicYear,
      status: "active",
      admittedByUserId: user.id,
    });

    await tx
      .update(students)
      .set({
        lifecycleStatus: "admitted",
        enrollmentStatus: "enrolled",
        recordStatus: "active",
        admissionNumber,
        admissionDate: body.admissionDate,
        classId: placement.classId,
        sectionId: placement.sectionId,
        className: placement.className,
        section: placement.section,
        stream: body.stream,
        academicYear: body.academicYear ?? student.academicYear,
        updatedByUserId: user.id,
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
    classId?: string;
    sectionId?: string;
    stream?: string;
    academicYear?: string;
  }>(req);

  const [existing] = await db
    .select()
    .from(studentAdmissions)
    .where(eq(studentAdmissions.id, id))
    .limit(1);

  if (!existing) throw new ApiError(404, "Admission not found");

  let placement: Awaited<ReturnType<typeof resolveClassSectionPlacement>> | null =
    null;
  if (body.classId && body.sectionId) {
    placement = await resolveClassSectionPlacement(body.classId, body.sectionId);
  }

  await db
    .update(studentAdmissions)
    .set({
      status: body.status ?? existing.status,
      className: placement?.className ?? existing.className,
      section: placement?.section ?? existing.section,
      stream: body.stream ?? existing.stream,
      academicYear: body.academicYear ?? existing.academicYear,
    })
    .where(eq(studentAdmissions.id, id));

  if (
    placement ||
    body.stream !== undefined ||
    body.academicYear !== undefined
  ) {
    const [updated] = await db
      .select()
      .from(studentAdmissions)
      .where(eq(studentAdmissions.id, id))
      .limit(1);

    if (updated) {
      await db
        .update(students)
        .set({
          ...(placement
            ? {
                classId: placement.classId,
                sectionId: placement.sectionId,
                className: placement.className,
                section: placement.section,
              }
            : {}),
          stream: updated.stream,
          academicYear: updated.academicYear ?? undefined,
        })
        .where(eq(students.id, existing.studentId));
    }
  }

  const enriched = await fetchAdmissionWithRelations(id);
  res.json({ success: true, data: enriched });
});