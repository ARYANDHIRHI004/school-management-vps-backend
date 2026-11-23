import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { feePaymentAlerts } from "../db/schema/fees.js";
import { students } from "../db/schema/students.js";
import {
  formatMobileForMsg91,
  isMsg91Enabled,
  sendMsg91FlowSms,
  type FeeAlertSmsType,
} from "./msg91.js";

type AlertSmsContext = {
  alertId: string;
  studentId: string;
  alertType: FeeAlertSmsType;
  title: string;
  message: string;
  sendSms?: boolean;
};

export async function dispatchFeeAlertSms(
  context: AlertSmsContext,
): Promise<void> {
  const shouldSend = context.sendSms ?? isMsg91Enabled();
  if (!shouldSend) {
    await db
      .update(feePaymentAlerts)
      .set({ smsStatus: "skipped" })
      .where(eq(feePaymentAlerts.id, context.alertId));
    return;
  }

  const [student] = await db
    .select({
      firstName: students.firstName,
      lastName: students.lastName,
      phone: students.phone,
    })
    .from(students)
    .where(eq(students.id, context.studentId))
    .limit(1);

  const mobile = formatMobileForMsg91(student?.phone);
  if (!mobile) {
    await db
      .update(feePaymentAlerts)
      .set({
        smsStatus: "failed",
        smsError: "Student phone number is missing or invalid",
      })
      .where(eq(feePaymentAlerts.id, context.alertId));
    return;
  }

  const studentName = student
    ? `${student.firstName} ${student.lastName}`.trim()
    : "Student";

  const result = await sendMsg91FlowSms({
    alertType: context.alertType,
    mobile,
    variables: {
      VAR1: studentName,
      VAR2: context.title,
      VAR3: context.message.slice(0, 480),
    },
  });

  if (result.ok) {
    await db
      .update(feePaymentAlerts)
      .set({
        smsStatus: "sent",
        smsMessageId: result.messageId,
        smsSentAt: new Date(),
        smsError: null,
      })
      .where(eq(feePaymentAlerts.id, context.alertId));
    return;
  }

  if (result.skipped) {
    await db
      .update(feePaymentAlerts)
      .set({ smsStatus: "skipped", smsError: result.error })
      .where(eq(feePaymentAlerts.id, context.alertId));
    return;
  }

  await db
    .update(feePaymentAlerts)
    .set({
      smsStatus: "failed",
      smsError: result.error,
    })
    .where(eq(feePaymentAlerts.id, context.alertId));

  console.error("MSG91 SMS failed:", result.error);
}