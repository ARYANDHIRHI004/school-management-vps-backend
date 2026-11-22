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

export const staffListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["active", "inactive", "resigned"]).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  isTeachingStaff: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
  search: z.string().max(100).optional(),
});

export const createStaffRegistrationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  designation: z.string().min(1).max(100),
  department: z.string().max(100).optional(),
  employmentType: z
    .enum(["permanent", "contract", "part_time"])
    .default("permanent"),
  isTeachingStaff: z.boolean().default(false),
  dateOfJoining: optionalDate,
  email: z.email().optional(),
  phone: z.string().min(6).max(20).optional(),
  gender: z.string().max(30).optional(),
  dateOfBirth: optionalDate,
  address: z.string().max(500).optional(),
  qualifications: z.string().max(500).optional(),
  subjectsTaught: z.string().max(500).optional(),
  baseSalaryPaise: moneyPaise.optional(),
  staffCode: z.string().min(1).max(50).optional(),
});

export const updateStaffRegistrationSchema = createStaffRegistrationSchema
  .partial()
  .extend({
    status: z.enum(["active", "inactive", "resigned"]).optional(),
  });

export const ledgerListQuerySchema = paginationQuerySchema.extend({
  staffId: z.string().min(1).optional(),
  category: z
    .enum([
      "opening_balance",
      "salary_payment",
      "advance",
      "deduction",
      "bonus",
      "reimbursement",
      "adjustment",
    ])
    .optional(),
  entryType: z.enum(["credit", "debit"]).optional(),
  fromDate: optionalDate,
  toDate: optionalDate,
});

export const createLedgerEntrySchema = z.object({
  staffId: z.string().min(1),
  entryDate: requiredDate,
  entryType: z.enum(["credit", "debit"]),
  category: z.enum([
    "opening_balance",
    "salary_payment",
    "advance",
    "deduction",
    "bonus",
    "reimbursement",
    "adjustment",
  ]),
  amountPaise: z.coerce.number().int().positive(),
  referenceNumber: z.string().max(80).optional(),
  description: z.string().max(1000).optional(),
});

export const paySlipListQuerySchema = paginationQuerySchema.extend({
  staffId: z.string().min(1).optional(),
  fromDate: optionalDate,
  toDate: optionalDate,
});

export const uploadPaySlipMetaSchema = z.object({
  staffId: z.string().min(1),
  payPeriodStart: requiredDate,
  payPeriodEnd: requiredDate,
  issueDate: requiredDate,
  slipNumber: z.string().min(1).max(50).optional(),
  grossAmountPaise: moneyPaise.optional(),
  netAmountPaise: moneyPaise.optional(),
  deductionsPaise: moneyPaise.optional(),
  notes: z.string().max(500).optional(),
});

export { idParamSchema };