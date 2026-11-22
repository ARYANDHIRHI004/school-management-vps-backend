import fs from "node:fs";
import { and, count, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  leavingCertificates,
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
import { getParamId } from "../utils/request.js";

type AuthUser = { id: string };

export const listTransferCertificates = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      studentId?: string;
    };
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
      })
      .from(transferCertificates)
      .where(where)
      .orderBy(desc(transferCertificates.createdAt))
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

export const uploadTransferCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const file = req.file;
    if (!file) throw new ApiError(400, "Certificate file is required");

    const body = req.body as {
      studentId: string;
      issueDate: string;
      reason?: string;
      certificateNumber?: string;
    };

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
        .set({ lifecycleStatus: "transferred" })
        .where(eq(students.id, body.studentId));
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
    const query = req.query as unknown as {
      page: number;
      limit: number;
      studentId?: string;
    };
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
      })
      .from(leavingCertificates)
      .where(where)
      .orderBy(desc(leavingCertificates.createdAt))
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

export const uploadLeavingCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const file = req.file;
    if (!file) throw new ApiError(400, "Certificate file is required");

    const body = req.body as {
      studentId: string;
      issueDate: string;
      reason?: string;
      certificateNumber?: string;
      lastClassAttended?: string;
    };

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
        .set({ lifecycleStatus: "left" })
        .where(eq(students.id, body.studentId));
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