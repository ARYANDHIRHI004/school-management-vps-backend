import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  feeCollectionAllocations,
  feeCollections,
  feeReceipts,
  studentFeeDueItems,
  studentFeeDues,
} from "../db/schema/fees.js";
import { students } from "../db/schema/students.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { getParamId } from "../utils/request.js";

export const listFeeReceipts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    limit: number;
    studentId?: string;
    fromDate?: string;
    toDate?: string;
  };

  const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

  const filters = [];
  if (scopedStudentId) {
    filters.push(eq(feeReceipts.studentId, scopedStudentId));
  }
  if (query.fromDate) {
    filters.push(gte(feeReceipts.issueDate, query.fromDate));
  }
  if (query.toDate) {
    filters.push(lte(feeReceipts.issueDate, query.toDate));
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(feeReceipts)
    .where(where);

  const rows = await db
    .select({
      receipt: feeReceipts,
      student: {
        firstName: students.firstName,
        lastName: students.lastName,
        admissionNumber: students.admissionNumber,
        rollNumber: students.rollNumber,
      },
    })
    .from(feeReceipts)
    .innerJoin(students, eq(feeReceipts.studentId, students.id))
    .where(where)
    .orderBy(desc(feeReceipts.issueDate))
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

export const getFeeReceipt = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [receipt] = await db
    .select()
    .from(feeReceipts)
    .where(eq(feeReceipts.id, id))
    .limit(1);

  if (!receipt) throw new ApiError(404, "Fee receipt not found");
  await assertStudentAccess(req, receipt.studentId);

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, receipt.studentId))
    .limit(1);

  const [collection] = await db
    .select()
    .from(feeCollections)
    .where(eq(feeCollections.id, receipt.collectionId))
    .limit(1);

  const allocations = await db
    .select({
      amountPaise: feeCollectionAllocations.amountPaise,
      due: studentFeeDues,
    })
    .from(feeCollectionAllocations)
    .innerJoin(
      studentFeeDues,
      eq(feeCollectionAllocations.dueId, studentFeeDues.id),
    )
    .where(eq(feeCollectionAllocations.collectionId, receipt.collectionId));

  const dueItems = await Promise.all(
    allocations.map(async (row) => {
      const items = await db
        .select()
        .from(studentFeeDueItems)
        .where(eq(studentFeeDueItems.dueId, row.due.id));
      return { ...row, items };
    }),
  );

  res.json({
    success: true,
    data: {
      receipt,
      student,
      collection,
      allocations: dueItems,
    },
  });
});