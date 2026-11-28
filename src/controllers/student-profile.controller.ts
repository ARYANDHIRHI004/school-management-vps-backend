import { and, desc, eq, isNull } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  studentAdmissions,
  studentInquiries,
  studentParents,
  studentRegistrations,
  students,
} from "../db/schema/students.js";
import { getStudentRowForUser } from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { isAdminRole } from "../utils/roles.js";
import { getParamId, getValidatedBody } from "../utils/request.js";
import { isPortalEligibleLifecycle } from "../utils/student-portal-access.js";

type AuthUser = { id: string; role?: string | null };

export const getMyStudentProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const student = await getStudentRowForUser(user.id);

    if (!student) {
      throw new ApiError(
        404,
        "No student profile is linked to your account. Contact the school admin.",
      );
    }

    const parents = await db
      .select()
      .from(studentParents)
      .where(eq(studentParents.studentId, student.id));

    const [latestRegistration] = await db
      .select()
      .from(studentRegistrations)
      .where(eq(studentRegistrations.studentId, student.id))
      .orderBy(desc(studentRegistrations.createdAt))
      .limit(1);

    const [latestAdmission] = await db
      .select()
      .from(studentAdmissions)
      .where(eq(studentAdmissions.studentId, student.id))
      .orderBy(desc(studentAdmissions.createdAt))
      .limit(1);

    const [latestInquiry] = await db
      .select()
      .from(studentInquiries)
      .where(eq(studentInquiries.studentId, student.id))
      .orderBy(desc(studentInquiries.createdAt))
      .limit(1);

    res.json({
      success: true,
      data: {
        student,
        parents,
        inquiry: latestInquiry ?? null,
        registration: latestRegistration ?? null,
        admission: latestAdmission ?? null,
      },
    });
  },
);

export const linkStudentToUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const body = req.body as { userId: string };

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    if (!student) throw new ApiError(404, "Student not found");

    if (!isPortalEligibleLifecycle(student.lifecycleStatus)) {
      throw new ApiError(
        400,
        "Portal login can only be linked after the student is admitted",
      );
    }

    const [updated] = await db
      .update(students)
      .set({ userId: body.userId })
      .where(eq(students.id, id))
      .returning();

    res.json({ success: true, data: updated });
  },
);

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const id = getParamId(req);

  const [student] = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), isNull(students.deletedAt)))
    .limit(1);

  if (!student) throw new ApiError(404, "Student not found");

  if (!isAdminRole(user.role) && student.userId !== user.id) {
    throw new ApiError(403, "You do not have access to this student record");
  }

  const parents = await db
    .select()
    .from(studentParents)
    .where(eq(studentParents.studentId, id));

  res.json({ success: true, data: { student, parents } });
});

export const updateStudentRecord = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const id = getParamId(req);

    const body = getValidatedBody<{
      firstName?: string;
      middleName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
      bloodGroup?: string;
      profilePhotoUrl?: string;
      recordStatus?: "active" | "inactive" | "graduated" | "withdrawn";
      email?: string;
      phone?: string;
      rollNumber?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      admissionDate?: string;
      academicYearId?: string;
      classId?: string;
      sectionId?: string;
      houseId?: string;
      className?: string;
      section?: string;
      stream?: string;
      academicYear?: string;
      previousSchool?: string;
      previousClass?: string;
      fatherName?: string;
      motherName?: string;
    }>(req);

    const [student] = await db
      .select()
      .from(students)
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .limit(1);

    if (!student) throw new ApiError(404, "Student not found");

    if (!isAdminRole(user.role)) {
      throw new ApiError(403, "Only admins can update student records");
    }

    const [updated] = await db
      .update(students)
      .set({
        ...body,
        address: body.addressLine1 ?? student.address,
        updatedByUserId: user.id,
      })
      .where(eq(students.id, id))
      .returning();

    res.json({ success: true, data: updated });
  },
);

export const softDeleteStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const id = getParamId(req);

    if (!isAdminRole(user.role)) {
      throw new ApiError(403, "Only admins can delete student records");
    }

    const [updated] = await db
      .update(students)
      .set({
        deletedAt: new Date(),
        recordStatus: "inactive",
        updatedByUserId: user.id,
      })
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .returning();

    if (!updated) throw new ApiError(404, "Student not found");

    res.json({ success: true, data: updated });
  },
);