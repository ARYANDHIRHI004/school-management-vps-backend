import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { studentFeeDues } from "../db/schema/fees.js";
import { students } from "../db/schema/students.js";
import { asyncHandler } from "../utils/async-handler.js";

export const listOutstandingStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      academicYear?: string;
      className?: string;
      section?: string;
      search?: string;
      minOutstandingPaise?: number;
    };

    const studentFilters = [];
    if (query.className) {
      studentFilters.push(eq(students.className, query.className));
    }
    if (query.section) {
      studentFilters.push(eq(students.section, query.section));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      studentFilters.push(
        or(
          ilike(students.firstName, pattern),
          ilike(students.lastName, pattern),
          ilike(students.admissionNumber, pattern),
          ilike(students.rollNumber, pattern),
        )!,
      );
    }

    const dueFilters = [
      sql`${studentFeeDues.status} != 'waived'`,
    ];
    if (query.academicYear) {
      dueFilters.push(eq(studentFeeDues.academicYear, query.academicYear));
    }

    const outstandingExpr = sql<number>`COALESCE(SUM(${studentFeeDues.totalAmountPaise} - ${studentFeeDues.paidAmountPaise}), 0)`;

    const having =
      query.minOutstandingPaise !== undefined
        ? sql`${outstandingExpr} >= ${query.minOutstandingPaise}`
        : sql`${outstandingExpr} > 0`;

    const baseQuery = db
      .select({
        studentId: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        className: students.className,
        section: students.section,
        admissionNumber: students.admissionNumber,
        rollNumber: students.rollNumber,
        outstandingPaise: outstandingExpr,
        openDueCount: sql<number>`COUNT(${studentFeeDues.id})`,
      })
      .from(students)
      .innerJoin(studentFeeDues, eq(studentFeeDues.studentId, students.id))
      .where(and(...studentFilters, ...dueFilters))
      .groupBy(
        students.id,
        students.firstName,
        students.lastName,
        students.className,
        students.section,
        students.admissionNumber,
        students.rollNumber,
      )
      .having(having);

    const offset = (query.page - 1) * query.limit;
    const rows = await baseQuery.limit(query.limit).offset(offset);

    const [totalRow] = await db
      .select({ total: count() })
      .from(
        db
          .select({ studentId: students.id })
          .from(students)
          .innerJoin(studentFeeDues, eq(studentFeeDues.studentId, students.id))
          .where(and(...studentFilters, ...dueFilters))
          .groupBy(students.id)
          .having(having)
          .as("outstanding_students"),
      );

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