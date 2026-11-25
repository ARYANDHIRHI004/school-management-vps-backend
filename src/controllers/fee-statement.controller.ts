import { and, asc, eq, gte, lte } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { feeCollections, studentFeeDues } from "../db/schema/fees.js";
import { students } from "../db/schema/students.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { outstandingPaise } from "../utils/fees.js";
import { getParamId, getValidatedQuery } from "../utils/request.js";

export const getStudentStatementByPath = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = getParamId(req, "studentId");
    const query = getValidatedQuery<{
      fromDate?: string;
      toDate?: string;
    }>(req);
    await assertStudentAccess(req, studentId);
    const payload = await buildStudentStatement(studentId, query);
    res.json({ success: true, data: payload });
  },
);

export const getStudentStatementByQuery = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      studentId?: string;
      fromDate?: string;
      toDate?: string;
    }>(req);
    const studentId = await resolveScopedStudentId(req, query.studentId);
    if (!studentId) {
      throw new ApiError(400, "studentId is required for admin statement view");
    }
    await assertStudentAccess(req, studentId);
    const payload = await buildStudentStatement(studentId, query);
    res.json({ success: true, data: payload });
  },
);

async function buildStudentStatement(
  studentId: string,
  query: { fromDate?: string; toDate?: string },
) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) throw new ApiError(404, "Student not found");

  const dueFilters = [eq(studentFeeDues.studentId, studentId)];
  const collectionFilters = [
    eq(feeCollections.studentId, studentId),
    eq(feeCollections.status, "completed"),
  ];

  if (query.fromDate) {
    dueFilters.push(gte(studentFeeDues.dueDate, query.fromDate));
    collectionFilters.push(gte(feeCollections.collectionDate, query.fromDate));
  }
  if (query.toDate) {
    dueFilters.push(lte(studentFeeDues.dueDate, query.toDate));
    collectionFilters.push(lte(feeCollections.collectionDate, query.toDate));
  }

  const dues = await db
    .select()
    .from(studentFeeDues)
    .where(and(...dueFilters))
    .orderBy(asc(studentFeeDues.dueDate));

  const collections = await db
    .select()
    .from(feeCollections)
    .where(and(...collectionFilters))
    .orderBy(asc(feeCollections.collectionDate));

  const allDues = await db
    .select()
    .from(studentFeeDues)
    .where(eq(studentFeeDues.studentId, studentId));

  let totalDuePaise = 0;
  let totalPaidOnDuesPaise = 0;
  for (const due of allDues) {
    if (due.status !== "waived") {
      totalDuePaise += due.totalAmountPaise;
      totalPaidOnDuesPaise += due.paidAmountPaise;
    }
  }

  const timeline = [
    ...dues.map((due) => ({
      type: "due" as const,
      date: due.dueDate,
      reference: due.dueNumber,
      amountPaise: due.totalAmountPaise,
      paidAmountPaise: due.paidAmountPaise,
      outstandingPaise: outstandingPaise(
        due.totalAmountPaise,
        due.paidAmountPaise,
      ),
      status: due.status,
      academicYear: due.academicYear,
      term: due.term,
    })),
    ...collections.map((row) => ({
      type: "collection" as const,
      date: row.collectionDate,
      reference: row.collectionNumber,
      amountPaise: row.amountPaise,
      paymentMode: row.paymentMode,
      remarks: row.remarks,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      className: student.className,
      section: student.section,
    },
    summary: {
      totalDuePaise,
      totalPaidPaise: totalPaidOnDuesPaise,
      outstandingPaise: Math.max(0, totalDuePaise - totalPaidOnDuesPaise),
    },
    timeline,
    dues,
    collections,
  };
}