import { and, count, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { students } from "../db/schema/students.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getValidatedQuery } from "../utils/request.js";

export const listStudentRecords = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      page: number;
      limit: number;
      search?: string;
      lifecycle?: "inquiry" | "registered" | "admitted" | "transferred" | "left";
      enrollmentStatus?:
        | "not_enrolled"
        | "enrolled"
        | "transferred"
        | "graduated"
        | "left";
      recordStatus?: "active" | "inactive" | "graduated" | "withdrawn";
      className?: string;
      section?: string;
    }>(req);

    const filters = [isNull(students.deletedAt)];

    if (query.lifecycle) {
      filters.push(eq(students.lifecycleStatus, query.lifecycle));
    }
    if (query.enrollmentStatus) {
      filters.push(eq(students.enrollmentStatus, query.enrollmentStatus));
    }
    if (query.recordStatus) {
      filters.push(eq(students.recordStatus, query.recordStatus));
    }
    if (query.className) {
      filters.push(ilike(students.className, query.className));
    }
    if (query.section) {
      filters.push(ilike(students.section, query.section));
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      filters.push(
        or(
          ilike(students.firstName, pattern),
          ilike(students.lastName, pattern),
          ilike(students.middleName, pattern),
          ilike(students.admissionNumber, pattern),
          ilike(students.rollNumber, pattern),
          ilike(students.phone, pattern),
          ilike(students.email, pattern),
        )!,
      );
    }

    const where = and(...filters);
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(students)
      .where(where);

    const rows = await db
      .select()
      .from(students)
      .where(where)
      .orderBy(desc(students.updatedAt))
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

export const listStudentClassSectionOptions = asyncHandler(
  async (_req: Request, res: Response) => {
    const classRows = await db
      .selectDistinct({ value: students.className })
      .from(students)
      .where(
        and(isNull(students.deletedAt), isNotNull(students.className)),
      )
      .orderBy(students.className);

    const sectionRows = await db
      .selectDistinct({ value: students.section })
      .from(students)
      .where(and(isNull(students.deletedAt), isNotNull(students.section)))
      .orderBy(students.section);

    res.json({
      success: true,
      data: {
        classes: classRows
          .map((r) => r.value)
          .filter((v): v is string => Boolean(v)),
        sections: sectionRows
          .map((r) => r.value)
          .filter((v): v is string => Boolean(v)),
      },
    });
  },
);