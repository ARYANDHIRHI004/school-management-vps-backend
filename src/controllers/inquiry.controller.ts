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
import { seedParentsFromLegacyNames } from "../utils/student-parents.js";
import {
  getParamId,
  getValidatedBody,
  getValidatedQuery,
} from "../utils/request.js";

type AuthUser = { id: string };

function splitStudentName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Unknown", lastName: "Unknown" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export const listInquiries = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{
    page: number;
    limit: number;
    status?: "open" | "converted" | "closed";
    search?: string;
  }>(req);

  const scopedStudentId = await resolveScopedStudentId(req);

  const filters = [];
  if (scopedStudentId) {
    filters.push(eq(studentInquiries.studentId, scopedStudentId));
  }
  if (query.status) {
    filters.push(eq(studentInquiries.status, query.status));
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    filters.push(
      or(
        ilike(studentInquiries.inquirerName, pattern),
        ilike(studentInquiries.inquiryNumber, pattern),
        ilike(studentInquiries.email, pattern),
      )!,
    );
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(studentInquiries)
    .where(where);

  const rows = await db
    .select()
    .from(studentInquiries)
    .where(where)
    .orderBy(desc(studentInquiries.createdAt))
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
});

export const getInquiry = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [row] = await db
    .select()
    .from(studentInquiries)
    .where(eq(studentInquiries.id, id))
    .limit(1);

  if (!row) throw new ApiError(404, "Inquiry not found");
  if (row.studentId) await assertStudentAccess(req, row.studentId);

  res.json({ success: true, data: row });
});

export const createInquiry = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const body = getValidatedBody<{
    firstName: string;
    middleName?: string;
    lastName: string;
    inquirerName: string;
    fatherName?: string;
    motherName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    className?: string;
    section?: string;
    stream?: string;
    academicYear?: string;
    rollNumber?: string;
    userId?: string;
    intendedClass?: string;
    intendedStream?: string;
    notes?: string;
  }>(req);

  const studentId = createId();
  const inquiryId = createId();

  await db.transaction(async (tx) => {
    await tx.insert(students).values({
      id: studentId,
      userId: body.userId,
      firstName: body.firstName,
      middleName: body.middleName,
      lastName: body.lastName,
      fatherName: body.fatherName,
      motherName: body.motherName,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      className: body.intendedClass ?? body.className,
      section: body.section,
      stream: body.intendedStream ?? body.stream,
      academicYear: body.academicYear,
      rollNumber: body.rollNumber,
      lifecycleStatus: "inquiry",
      createdByUserId: user.id,
    });

    await seedParentsFromLegacyNames(
      tx,
      studentId,
      body.fatherName,
      body.motherName,
    );

    await tx.insert(studentInquiries).values({
      id: inquiryId,
      inquiryNumber: createDocumentNumber("INQ"),
      studentId,
      inquirerName: body.inquirerName,
      email: body.email,
      phone: body.phone,
      intendedClass: body.intendedClass,
      intendedStream: body.intendedStream,
      academicYear: body.academicYear,
      notes: body.notes,
      status: "open",
      createdByUserId: user.id,
    });
  });

  const [inquiry] = await db
    .select()
    .from(studentInquiries)
    .where(eq(studentInquiries.id, inquiryId));

  res.status(201).json({ success: true, data: inquiry });
});

export const createPublicInquiry = asyncHandler(async (req: Request, res: Response) => {
  const body = getValidatedBody<{
    studentName: string;
    intendedClass: string;
    phone: string;
  }>(req);

  const { firstName, lastName } = splitStudentName(body.studentName);
  const studentId = createId();
  const inquiryId = createId();
  const notes = "Submitted via website admission form";

  await db.transaction(async (tx) => {
    await tx.insert(students).values({
      id: studentId,
      firstName,
      lastName,
      phone: body.phone,
      className: body.intendedClass,
      lifecycleStatus: "inquiry",
    });

    await tx.insert(studentInquiries).values({
      id: inquiryId,
      inquiryNumber: createDocumentNumber("INQ"),
      studentId,
      inquirerName: body.studentName.trim(),
      phone: body.phone,
      intendedClass: body.intendedClass,
      notes,
      status: "open",
      createdByUserId: null,
    });
  });

  const [inquiry] = await db
    .select()
    .from(studentInquiries)
    .where(eq(studentInquiries.id, inquiryId));

  res.status(201).json({ success: true, data: inquiry });
});

export const updateInquiry = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [existing] = await db
    .select()
    .from(studentInquiries)
    .where(eq(studentInquiries.id, id))
    .limit(1);

  if (!existing) throw new ApiError(404, "Inquiry not found");

  const body = getValidatedBody<{
    inquirerName?: string;
    email?: string;
    phone?: string;
    intendedClass?: string;
    intendedStream?: string;
    academicYear?: string;
    notes?: string;
    status?: "open" | "converted" | "closed";
  }>(req);

  const [updated] = await db
    .update(studentInquiries)
    .set({
      inquirerName: body.inquirerName ?? existing.inquirerName,
      email: body.email ?? existing.email,
      phone: body.phone ?? existing.phone,
      intendedClass: body.intendedClass ?? existing.intendedClass,
      intendedStream: body.intendedStream ?? existing.intendedStream,
      academicYear: body.academicYear ?? existing.academicYear,
      notes: body.notes ?? existing.notes,
      status: body.status ?? existing.status,
    })
    .where(eq(studentInquiries.id, id))
    .returning();

  res.json({ success: true, data: updated });
});

export const convertInquiryToRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const id = getParamId(req);
    const body = getValidatedBody<{
      registrationDate: string;
      remarks?: string;
    }>(req);

    const [inquiry] = await db
      .select()
      .from(studentInquiries)
      .where(eq(studentInquiries.id, id))
      .limit(1);

    if (!inquiry) throw new ApiError(404, "Inquiry not found");
    if (inquiry.status === "converted") {
      throw new ApiError(400, "Inquiry is already converted");
    }
    if (!inquiry.studentId) {
      throw new ApiError(400, "Inquiry is not linked to a student record");
    }

    const studentId = inquiry.studentId;
    const registrationId = createId();
    const registrationNumber = createDocumentNumber("REG");

    await db.transaction(async (tx) => {
      await tx.insert(studentRegistrations).values({
        id: registrationId,
        registrationNumber,
        studentId,
        inquiryId: inquiry.id,
        registrationDate: body.registrationDate,
        status: "pending",
        remarks: body.remarks,
        registeredByUserId: user.id,
      });

      await tx
        .update(studentInquiries)
        .set({ status: "converted" })
        .where(eq(studentInquiries.id, inquiry.id));

      await tx
        .update(students)
        .set({
          lifecycleStatus: "registered",
          registrationNumber,
        })
        .where(eq(students.id, studentId));
    });

    const [registration] = await db
      .select()
      .from(studentRegistrations)
      .where(eq(studentRegistrations.id, registrationId));

    res.status(201).json({ success: true, data: registration });
  },
);