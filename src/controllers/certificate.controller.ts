import fs from "node:fs";
import { and, count, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  leavingCertificates,
  studentAdmissions,
  students,
  transferCertificates,
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

type AuthUser = { id: string };

export const listTransferCertificates = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      page: number;
      limit: number;
      studentId?: string;
    }>(req);
    const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

    const filters = [];
    if (scopedStudentId) {
      filters.push(eq(transferCertificates.studentId, scopedStudentId));
    }

    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(transferCertificates)
      .where(where);

    const rows = await db
      .select({
        id: transferCertificates.id,
        certificateNumber: transferCertificates.certificateNumber,
        studentId: transferCertificates.studentId,
        issueDate: transferCertificates.issueDate,
        reason: transferCertificates.reason,
        fileName: transferCertificates.fileName,
        mimeType: transferCertificates.mimeType,
        fileSize: transferCertificates.fileSize,
        createdAt: transferCertificates.createdAt,
        studentFirstName: students.firstName,
        studentLastName: students.lastName,
        studentAdmissionNumber: students.admissionNumber,
        studentRollNumber: students.rollNumber,
      })
      .from(transferCertificates)
      .innerJoin(students, eq(transferCertificates.studentId, students.id))
      .where(where)
      .orderBy(desc(transferCertificates.createdAt))
      .limit(query.limit)
      .offset(offset);

    res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        certificateNumber: row.certificateNumber,
        studentId: row.studentId,
        issueDate: row.issueDate,
        reason: row.reason,
        fileName: row.fileName,
        mimeType: row.mimeType,
        fileSize: row.fileSize,
        createdAt: row.createdAt,
        student: {
          id: row.studentId,
          firstName: row.studentFirstName,
          lastName: row.studentLastName,
          admissionNumber: row.studentAdmissionNumber,
          rollNumber: row.studentRollNumber,
        },
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total: Number(totalRow?.total ?? 0),
      },
    });
  },
);

export const uploadTransferCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const file = req.file;
    if (!file) throw new ApiError(400, "Certificate file is required");

    const body = getValidatedBody<{
      studentId: string;
      issueDate: string;
      reason?: string;
      certificateNumber?: string;
    }>(req);

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, body.studentId))
      .limit(1);

    if (!student) throw new ApiError(404, "Student not found");

    const id = createId();
    const certificateNumber =
      body.certificateNumber ?? createDocumentNumber("TC");

    await db.transaction(async (tx) => {
      await tx.insert(transferCertificates).values({
        id,
        certificateNumber,
        studentId: body.studentId,
        issueDate: body.issueDate,
        reason: body.reason,
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedByUserId: user.id,
      });

      await tx
        .update(students)
        .set({
          lifecycleStatus: "transferred",
          enrollmentStatus: "transferred",
          recordStatus: "inactive",
          departedAt: body.issueDate,
          departureReason: body.reason?.trim() || null,
        })
        .where(eq(students.id, body.studentId));

      await tx
        .update(studentAdmissions)
        .set({ status: "completed" })
        .where(
          and(
            eq(studentAdmissions.studentId, body.studentId),
            eq(studentAdmissions.status, "active"),
          ),
        );
    });

    const [row] = await db
      .select()
      .from(transferCertificates)
      .where(eq(transferCertificates.id, id));

    res.status(201).json({ success: true, data: row });
  },
);

export const downloadTransferCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const [row] = await db
      .select()
      .from(transferCertificates)
      .where(eq(transferCertificates.id, id))
      .limit(1);

    if (!row) throw new ApiError(404, "Transfer certificate not found");
    await assertStudentAccess(req, row.studentId);

    if (!fs.existsSync(row.filePath)) {
      throw new ApiError(404, "Certificate file not found on server");
    }

    res.download(row.filePath, row.fileName);
  },
);

export const listLeavingCertificates = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      page: number;
      limit: number;
      studentId?: string;
    }>(req);
    const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

    const filters = [];
    if (scopedStudentId) {
      filters.push(eq(leavingCertificates.studentId, scopedStudentId));
    }

    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(leavingCertificates)
      .where(where);

    const rows = await db
      .select({
        id: leavingCertificates.id,
        certificateNumber: leavingCertificates.certificateNumber,
        studentId: leavingCertificates.studentId,
        issueDate: leavingCertificates.issueDate,
        reason: leavingCertificates.reason,
        lastClassAttended: leavingCertificates.lastClassAttended,
        fileName: leavingCertificates.fileName,
        mimeType: leavingCertificates.mimeType,
        fileSize: leavingCertificates.fileSize,
        createdAt: leavingCertificates.createdAt,
        studentFirstName: students.firstName,
        studentLastName: students.lastName,
        studentAdmissionNumber: students.admissionNumber,
        studentRollNumber: students.rollNumber,
      })
      .from(leavingCertificates)
      .innerJoin(students, eq(leavingCertificates.studentId, students.id))
      .where(where)
      .orderBy(desc(leavingCertificates.createdAt))
      .limit(query.limit)
      .offset(offset);

    res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        certificateNumber: row.certificateNumber,
        studentId: row.studentId,
        issueDate: row.issueDate,
        reason: row.reason,
        lastClassAttended: row.lastClassAttended,
        fileName: row.fileName,
        mimeType: row.mimeType,
        fileSize: row.fileSize,
        createdAt: row.createdAt,
        student: {
          id: row.studentId,
          firstName: row.studentFirstName,
          lastName: row.studentLastName,
          admissionNumber: row.studentAdmissionNumber,
          rollNumber: row.studentRollNumber,
        },
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total: Number(totalRow?.total ?? 0),
      },
    });
  },
);

export const uploadLeavingCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const file = req.file;
    if (!file) throw new ApiError(400, "Certificate file is required");

    const body = getValidatedBody<{
      studentId: string;
      issueDate: string;
      reason?: string;
      certificateNumber?: string;
      lastClassAttended?: string;
    }>(req);

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, body.studentId))
      .limit(1);

    if (!student) throw new ApiError(404, "Student not found");

    const id = createId();
    const certificateNumber =
      body.certificateNumber ?? createDocumentNumber("LC");

    await db.transaction(async (tx) => {
      await tx.insert(leavingCertificates).values({
        id,
        certificateNumber,
        studentId: body.studentId,
        issueDate: body.issueDate,
        reason: body.reason,
        lastClassAttended: body.lastClassAttended,
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedByUserId: user.id,
      });

      await tx
        .update(students)
        .set({
          lifecycleStatus: "left",
          enrollmentStatus: "left",
          recordStatus: "withdrawn",
          departedAt: body.issueDate,
          departureReason: body.reason?.trim() || null,
        })
        .where(eq(students.id, body.studentId));

      await tx
        .update(studentAdmissions)
        .set({ status: "completed" })
        .where(
          and(
            eq(studentAdmissions.studentId, body.studentId),
            eq(studentAdmissions.status, "active"),
          ),
        );
    });

    const [row] = await db
      .select()
      .from(leavingCertificates)
      .where(eq(leavingCertificates.id, id));

    res.status(201).json({ success: true, data: row });
  },
);

export const downloadLeavingCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const [row] = await db
      .select()
      .from(leavingCertificates)
      .where(eq(leavingCertificates.id, id))
      .limit(1);

    if (!row) throw new ApiError(404, "Leaving certificate not found");
    await assertStudentAccess(req, row.studentId);

    if (!fs.existsSync(row.filePath)) {
      throw new ApiError(404, "Certificate file not found on server");
    }

    res.download(row.filePath, row.fileName);
  },
);