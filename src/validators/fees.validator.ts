import { z } from "zod";
import { paginationQuerySchema } from "./common.validator.js";
import { idParamSchema } from "./student.validator.js";

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .optional();

const requiredDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const moneyPaise = z.coerce.number().int().nonnegative();
const positiveMoneyPaise = z.coerce.number().int().positive();

export const createFeeHeadSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateFeeHeadSchema = createFeeHeadSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const feeHeadListQuerySchema = paginationQuerySchema.extend({
  isActive: z.enum(["true", "false"]).optional(),
  search: z.string().max(100).optional(),
});

const feeDueItemSchema = z.object({
  feeHeadId: z.string().min(1).optional(),
  label: z.string().min(1).max(150),
  amountPaise: positiveMoneyPaise,
});

export const createStudentFeeDueSchema = z.object({
  studentId: z.string().min(1),
  academicYear: z.string().max(20).optional(),
  term: z.string().max(50).optional(),
  dueDate: requiredDate,
  notes: z.string().max(1000).optional(),
  dueNumber: z.string().min(1).max(50).optional(),
  items: z.array(feeDueItemSchema).min(1),
});

export const updateStudentFeeDueSchema = z.object({
  dueDate: requiredDate.optional(),
  status: z.enum(["pending", "partial", "paid", "overdue", "waived"]).optional(),
  notes: z.string().max(1000).optional(),
  academicYear: z.string().max(20).optional(),
  term: z.string().max(50).optional(),
});

export const feeDueListQuerySchema = paginationQuerySchema.extend({
  studentId: z.string().min(1).optional(),
  status: z
    .enum(["pending", "partial", "paid", "overdue", "waived"])
    .optional(),
  academicYear: z.string().max(20).optional(),
});

const allocationSchema = z.object({
  dueId: z.string().min(1),
  amountPaise: positiveMoneyPaise,
});

export const createFeeCollectionSchema = z.object({
  studentId: z.string().min(1),
  collectionDate: requiredDate,
  amountPaise: positiveMoneyPaise,
  paymentMode: z.enum([
    "cash",
    "cheque",
    "bank_transfer",
    "upi_offline",
    "other",
  ]),
  referenceNumber: z.string().max(80).optional(),
  remarks: z.string().max(500).optional(),
  collectionNumber: z.string().min(1).max(50).optional(),
  allocations: z.array(allocationSchema).min(1),
});

export const feeCollectionListQuerySchema = paginationQuerySchema.extend({
  studentId: z.string().min(1).optional(),
  fromDate: optionalDate,
  toDate: optionalDate,
  paymentMode: z
    .enum(["cash", "cheque", "bank_transfer", "upi_offline", "other"])
    .optional(),
});

export const feeReceiptListQuerySchema = paginationQuerySchema.extend({
  studentId: z.string().min(1).optional(),
  fromDate: optionalDate,
  toDate: optionalDate,
});

export const studentStatementQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  fromDate: optionalDate,
  toDate: optionalDate,
});

export const outstandingListQuerySchema = paginationQuerySchema.extend({
  academicYear: z.string().max(20).optional(),
  className: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  minOutstandingPaise: moneyPaise.optional(),
});

export const createFeeAlertSchema = z.object({
  studentId: z.string().min(1),
  dueId: z.string().min(1).optional(),
  alertType: z
    .enum(["due_reminder", "overdue", "payment_received", "custom"])
    .default("custom"),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(2000),
  scheduledFor: optionalDate,
});

export const feeAlertListQuerySchema = paginationQuerySchema.extend({
  studentId: z.string().min(1).optional(),
  status: z.enum(["unread", "read", "dismissed"]).optional(),
  alertType: z
    .enum(["due_reminder", "overdue", "payment_received", "custom"])
    .optional(),
});

export const updateFeeAlertStatusSchema = z.object({
  status: z.enum(["read", "dismissed"]),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().min(1),
});

export { idParamSchema };