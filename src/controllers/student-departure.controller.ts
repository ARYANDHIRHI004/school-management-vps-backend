import { and, count, desc, eq, inArray } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { studentAdmissions, students } from "../db/schema/students.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { getValidatedBody, getValidatedQuery } from "../utils/request.js";

const departedLifecycle = ["left", "transferred"] as const;
type DepartedLifecycle = (typeof departedLifecycle)[number];

export const markStudentDeparture = asyncHandler(
  async (req: Request, res: Response) => {
    const body = getValidatedBody<{
      studentId: string;
      departureType: DepartedLifecycle;
      departedAt: string;
      reason?: string;
    }>(req);

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, body.studentId))
      .limit(1);

    if (!student) throw new ApiError(404, "Student not found");

    if (
      student.lifecycleStatus === "left" ||
      student.lifecycleStatus === "transferred"
    ) {
      throw new ApiError(
        400,
        `Student is already marked as ${student.lifecycleStatus}`,
      );
    }

    if (student.lifecycleStatus !== "admitted") {
      throw new ApiError(
        400,
        "Only admitted students can be marked as having left the school",
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .update(students)
        .set({
          lifecycleStatus: body.departureType,
          enrollmentStatus: body.departureType,
          recordStatus:
            body.departureType === "left" ? "withdrawn" : "inactive",
          departedAt: body.departedAt,
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

    const [updated] = await db
      .select()
      .from(students)
      .where(eq(students.id, body.studentId))
      .limit(1);

    res.json({ success: true, data: updated });
  },
);

export const listDepartedStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      page: number;
      limit: number;
      departureType?: DepartedLifecycle;
    }>(req);

    const lifecycleFilter = query.departureType
      ? eq(students.lifecycleStatus, query.departureType)
      : inArray(students.lifecycleStatus, [...departedLifecycle]);

    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(students)
      .where(lifecycleFilter);

    const rows = await db
      .select()
      .from(students)
      .where(lifecycleFilter)
      .orderBy(desc(students.departedAt), desc(students.updatedAt))
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