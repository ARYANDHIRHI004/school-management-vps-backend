import { and, count, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
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
import { computeDueStatus, outstandingPaise } from "../utils/fees.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createId } from "../utils/ids.js";
import { getParamId } from "../utils/request.js";

type AuthUser = { id: string };

async function assertStudentExists(studentId: string) {
  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!student) throw new ApiError(404, "Student not found");
}

export const listFeeDues = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    limit: number;
    studentId?: string;
    status?: "pending" | "partial" | "paid" | "overdue" | "waived";
    academicYear?: string;
  };

  const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

  const filters = [];
  if (scopedStudentId) {
    filters.push(eq(studentFeeDues.studentId, scopedStudentId));
  }
  if (query.status) {
    filters.push(eq(studentFeeDues.status, query.status));
  }
  if (query.academicYear) {
    filters.push(eq(studentFeeDues.academicYear, query.academicYear));
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(studentFeeDues)
    .where(where);

  const rows = await db
    .select()
    .from(studentFeeDues)
    .where(where)
    .orderBy(desc(studentFeeDues.dueDate))
    .limit(query.limit)
    .offset(offset);

  res.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      outstandingPaise: outstandingPaise(
        row.totalAmountPaise,
        row.paidAmountPaise,
      ),
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total: Number(totalRow?.total ?? 0),
    },
  });
});

export const getFeeDue = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [due] = await db
    .select()
    .from(studentFeeDues)
    .where(eq(studentFeeDues.id, id))
    .limit(1);

  if (!due) throw new ApiError(404, "Fee due not found");
  await assertStudentAccess(req, due.studentId);

  const items = await db
    .select()
    .from(studentFeeDueItems)
    .where(eq(studentFeeDueItems.dueId, due.id));

  res.json({
    success: true,
    data: {
      ...due,
      outstandingPaise: outstandingPaise(
        due.totalAmountPaise,
        due.paidAmountPaise,
      ),
      items,
    },
  });
});

export const createFeeDue = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const body = req.body as {
    studentId: string;
    academicYear?: string;
    term?: string;
    dueDate: string;
    notes?: string;
    dueNumber?: string;
    items: { feeHeadId?: string; label: string; amountPaise: number }[];
  };

  await assertStudentExists(body.studentId);

  const totalAmountPaise = body.items.reduce(
    (sum, item) => sum + item.amountPaise,
    0,
  );

  if (totalAmountPaise <= 0) {
    throw new ApiError(400, "Fee due total must be greater than zero");
  }

  const dueId = createId();
  const dueNumber = body.dueNumber ?? createDocumentNumber("DUE");
  const status = computeDueStatus({
    totalAmountPaise,
    paidAmountPaise: 0,
    dueDate: body.dueDate,
  });

  await db.transaction(async (tx) => {
    await tx.insert(studentFeeDues).values({
      id: dueId,
      dueNumber,
      studentId: body.studentId,
      academicYear: body.academicYear,
      term: body.term,
      dueDate: body.dueDate,
      status,
      totalAmountPaise,
      paidAmountPaise: 0,
      notes: body.notes,
      createdByUserId: user.id,
    });

    await tx.insert(studentFeeDueItems).values(
      body.items.map((item) => ({
        id: createId(),
        dueId,
        feeHeadId: item.feeHeadId,
        label: item.label,
        amountPaise: item.amountPaise,
      })),
    );
  });

  const [due] = await db
    .select()
    .from(studentFeeDues)
    .where(eq(studentFeeDues.id, dueId));

  const items = await db
    .select()
    .from(studentFeeDueItems)
    .where(eq(studentFeeDueItems.dueId, dueId));

  res.status(201).json({
    success: true,
    data: {
      ...due!,
      outstandingPaise: totalAmountPaise,
      items,
    },
  });
});

export const updateFeeDue = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const body = req.body as {
    dueDate?: string;
    status?: "pending" | "partial" | "paid" | "overdue" | "waived";
    notes?: string;
    academicYear?: string;
    term?: string;
  };

  const [existing] = await db
    .select()
    .from(studentFeeDues)
    .where(eq(studentFeeDues.id, id))
    .limit(1);

  if (!existing) throw new ApiError(404, "Fee due not found");

  const dueDate = body.dueDate ?? existing.dueDate;
  let status = body.status;
  if (!status) {
    status = computeDueStatus({
      totalAmountPaise: existing.totalAmountPaise,
      paidAmountPaise: existing.paidAmountPaise,
      dueDate,
      waived: existing.status === "waived",
    });
  } else if (status !== "waived" && status !== "overdue") {
    status = computeDueStatus({
      totalAmountPaise: existing.totalAmountPaise,
      paidAmountPaise: existing.paidAmountPaise,
      dueDate,
    });
  }

  const [updated] = await db
    .update(studentFeeDues)
    .set({
      dueDate,
      status,
      notes: body.notes ?? existing.notes,
      academicYear: body.academicYear ?? existing.academicYear,
      term: body.term ?? existing.term,
    })
    .where(eq(studentFeeDues.id, id))
    .returning();

  res.json({
    success: true,
    data: {
      ...updated!,
      outstandingPaise: outstandingPaise(
        updated!.totalAmountPaise,
        updated!.paidAmountPaise,
      ),
    },
  });
});