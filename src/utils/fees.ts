import { sql } from "drizzle-orm";

export type FeeDueStatus =
  | "pending"
  | "partial"
  | "paid"
  | "overdue"
  | "waived";

export function computeDueStatus(input: {
  totalAmountPaise: number;
  paidAmountPaise: number;
  dueDate: string;
  waived?: boolean;
}): FeeDueStatus {
  if (input.waived) return "waived";
  if (input.paidAmountPaise >= input.totalAmountPaise) return "paid";
  if (input.paidAmountPaise > 0) return "partial";

  const today = new Date().toISOString().slice(0, 10);
  if (input.dueDate < today) return "overdue";
  return "pending";
}

export function outstandingPaise(
  totalAmountPaise: number,
  paidAmountPaise: number,
): number {
  return Math.max(0, totalAmountPaise - paidAmountPaise);
}

export const todaySqlDate = sql`CURRENT_DATE`;