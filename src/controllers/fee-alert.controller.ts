import { and, count, desc, eq, inArray, lt, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  feePaymentAlerts,
  studentFeeDues,
} from "../db/schema/fees.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { computeDueStatus, outstandingPaise } from "../utils/fees.js";
import { createFeePaymentAlert } from "../utils/fee-alert-create.js";
import { paiseToInrLabel } from "../utils/msg91.js";
import { getParamId, getValidatedQuery } from "../utils/request.js";

type AuthUser = { id: string };

export const listFeeAlerts = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{
    page: number;
    limit: number;
    studentId?: string;
    status?: "unread" | "read" | "dismissed";
    alertType?: "due_reminder" | "overdue" | "payment_received" | "custom";
  }>(req);

  const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

  const filters = [];
  if (scopedStudentId) {
    filters.push(eq(feePaymentAlerts.studentId, scopedStudentId));
  }
  if (query.status) {
    filters.push(eq(feePaymentAlerts.status, query.status));
  }
  if (query.alertType) {
    filters.push(eq(feePaymentAlerts.alertType, query.alertType));
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(feePaymentAlerts)
    .where(where);

  const rows = await db
    .select()
    .from(feePaymentAlerts)
    .where(where)
    .orderBy(desc(feePaymentAlerts.createdAt))
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

export const createFeeAlert = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const body = req.body as {
    studentId: string;
    dueId?: string;
    alertType: "due_reminder" | "overdue" | "payment_received" | "custom";
    severity: "info" | "warning" | "critical";
    title: string;
    message: string;
    scheduledFor?: string;
    sendSms?: boolean;
  };

  if (body.dueId) {
    const [due] = await db
      .select()
      .from(studentFeeDues)
      .where(eq(studentFeeDues.id, body.dueId))
      .limit(1);
    if (!due || due.studentId !== body.studentId) {
      throw new ApiError(400, "dueId does not belong to the provided studentId");
    }
  }

  const row = await createFeePaymentAlert({
    studentId: body.studentId,
    dueId: body.dueId,
    alertType: body.alertType,
    severity: body.severity,
    title: body.title,
    message: body.message,
    scheduledFor: body.scheduledFor,
    createdByUserId: user.id,
    sendSms: body.sendSms,
  });

  res.status(201).json({ success: true, data: row });
});

export const updateFeeAlertStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const body = req.body as { status: "read" | "dismissed" };

    const [existing] = await db
      .select()
      .from(feePaymentAlerts)
      .where(eq(feePaymentAlerts.id, id))
      .limit(1);

    if (!existing) throw new ApiError(404, "Alert not found");
    await assertStudentAccess(req, existing.studentId);

    const [updated] = await db
      .update(feePaymentAlerts)
      .set({
        status: body.status,
        readAt: body.status === "read" ? new Date() : existing.readAt,
        dismissedAt:
          body.status === "dismissed" ? new Date() : existing.dismissedAt,
      })
      .where(eq(feePaymentAlerts.id, id))
      .returning();

    res.json({ success: true, data: updated });
  },
);

export const generateOverdueFeeAlerts = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const today = new Date().toISOString().slice(0, 10);

    const dues = await db
      .select()
      .from(studentFeeDues)
      .where(
        and(
          inArray(studentFeeDues.status, ["pending", "partial", "overdue"]),
          lt(studentFeeDues.dueDate, today),
        ),
      );

    let created = 0;
    let smsSent = 0;

    for (const due of dues) {
      const outstanding = outstandingPaise(
        due.totalAmountPaise,
        due.paidAmountPaise,
      );
      if (outstanding <= 0) continue;

      const status = computeDueStatus({
        totalAmountPaise: due.totalAmountPaise,
        paidAmountPaise: due.paidAmountPaise,
        dueDate: due.dueDate,
      });
      if (due.status !== status) {
        await db
          .update(studentFeeDues)
          .set({ status })
          .where(eq(studentFeeDues.id, due.id));
      }

      const [existingAlert] = await db
        .select({ id: feePaymentAlerts.id })
        .from(feePaymentAlerts)
        .where(
          and(
            eq(feePaymentAlerts.dueId, due.id),
            eq(feePaymentAlerts.alertType, "overdue"),
            eq(feePaymentAlerts.status, "unread"),
          ),
        )
        .limit(1);

      if (existingAlert) continue;

      const message = `Fee due ${due.dueNumber} is overdue. Outstanding: ${paiseToInrLabel(outstanding)}. Due date: ${due.dueDate}.`;
      const row = await createFeePaymentAlert({
        studentId: due.studentId,
        dueId: due.id,
        alertType: "overdue",
        severity: "warning",
        title: "Overdue school fees",
        message,
        createdByUserId: user.id,
      });
      created += 1;
      if (row.smsStatus === "sent") smsSent += 1;
    }

    res.json({
      success: true,
      data: {
        alertsCreated: created,
        smsSent,
      },
    });
  },
);

export const generateDueReminders = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const daysAhead = Number(
      (req.query as { daysAhead?: string }).daysAhead ?? 7,
    );
    const target = new Date();
    target.setDate(target.getDate() + daysAhead);
    const targetDate = target.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const dues = await db
      .select()
      .from(studentFeeDues)
      .where(
        and(
          inArray(studentFeeDues.status, ["pending", "partial"]),
          sql`${studentFeeDues.dueDate} >= ${today}`,
          sql`${studentFeeDues.dueDate} <= ${targetDate}`,
        ),
      );

    let created = 0;
    let smsSent = 0;

    for (const due of dues) {
      const outstanding = outstandingPaise(
        due.totalAmountPaise,
        due.paidAmountPaise,
      );
      if (outstanding <= 0) continue;

      const [existingAlert] = await db
        .select({ id: feePaymentAlerts.id })
        .from(feePaymentAlerts)
        .where(
          and(
            eq(feePaymentAlerts.dueId, due.id),
            eq(feePaymentAlerts.alertType, "due_reminder"),
            eq(feePaymentAlerts.status, "unread"),
          ),
        )
        .limit(1);

      if (existingAlert) continue;

      const message = `Fee due ${due.dueNumber} is due on ${due.dueDate}. Outstanding: ${paiseToInrLabel(outstanding)}.`;
      const row = await createFeePaymentAlert({
        studentId: due.studentId,
        dueId: due.id,
        alertType: "due_reminder",
        severity: "info",
        title: "Upcoming fee due",
        message,
        scheduledFor: due.dueDate,
        createdByUserId: user.id,
      });
      created += 1;
      if (row.smsStatus === "sent") smsSent += 1;
    }

    res.json({
      success: true,
      data: {
        alertsCreated: created,
        smsSent,
        daysAhead,
      },
    });
  },
);