import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { feePaymentAlerts } from "../db/schema/fees.js";
import { dispatchFeeAlertSms } from "./fee-alert-notify.js";
import { createId } from "./ids.js";
import type { FeeAlertSmsType } from "./msg91.js";

type FeeAlertInsert = {
  studentId: string;
  dueId?: string | null;
  alertType: FeeAlertSmsType;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  scheduledFor?: string | null;
  createdByUserId?: string | null;
  sendSms?: boolean;
};

export async function createFeePaymentAlert(input: FeeAlertInsert) {
  const id = createId();

  await db.insert(feePaymentAlerts).values({
    id,
    studentId: input.studentId,
    dueId: input.dueId ?? null,
    alertType: input.alertType,
    severity: input.severity,
    status: "unread",
    title: input.title,
    message: input.message,
    scheduledFor: input.scheduledFor ?? null,
    createdByUserId: input.createdByUserId ?? null,
    smsStatus: "pending",
  });

  await dispatchFeeAlertSms({
    alertId: id,
    studentId: input.studentId,
    alertType: input.alertType,
    title: input.title,
    message: input.message,
    sendSms: input.sendSms,
  });

  const [row] = await db
    .select()
    .from(feePaymentAlerts)
    .where(eq(feePaymentAlerts.id, id));

  return row!;
}