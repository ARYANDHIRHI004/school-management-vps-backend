import { relations } from "drizzle-orm";
import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const staffStatusEnum = pgEnum("staff_status", [
  "active",
  "inactive",
  "resigned",
]);

export const staffEmploymentTypeEnum = pgEnum("staff_employment_type", [
  "permanent",
  "contract",
  "part_time",
]);

export const staffLedgerEntryTypeEnum = pgEnum("staff_ledger_entry_type", [
  "credit",
  "debit",
]);

export const staffLedgerCategoryEnum = pgEnum("staff_ledger_category", [
  "opening_balance",
  "salary_payment",
  "advance",
  "deduction",
  "bonus",
  "reimbursement",
  "adjustment",
]);

export const staffMembers = pgTable(
  "staff_members",
  {
    id: text("id").primaryKey(),
    staffCode: text("staff_code").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    designation: text("designation").notNull(),
    department: text("department"),
    employmentType: staffEmploymentTypeEnum("employment_type")
      .default("permanent")
      .notNull(),
    isTeachingStaff: integer("is_teaching_staff").default(0).notNull(),
    dateOfJoining: date("date_of_joining"),
    email: text("email"),
    phone: text("phone"),
    gender: text("gender"),
    dateOfBirth: date("date_of_birth"),
    address: text("address"),
    qualifications: text("qualifications"),
    subjectsTaught: text("subjects_taught"),
    baseSalaryPaise: bigint("base_salary_paise", { mode: "number" }),
    status: staffStatusEnum("status").default("active").notNull(),
    registeredByUserId: text("registered_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("staff_members_status_idx").on(table.status),
    index("staff_members_department_idx").on(table.department),
    index("staff_members_designation_idx").on(table.designation),
  ],
);

export const staffLedgerEntries = pgTable(
  "staff_ledger_entries",
  {
    id: text("id").primaryKey(),
    staffId: text("staff_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    entryDate: date("entry_date").notNull(),
    entryType: staffLedgerEntryTypeEnum("entry_type").notNull(),
    category: staffLedgerCategoryEnum("category").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    referenceNumber: text("reference_number"),
    description: text("description"),
    recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("staff_ledger_entries_staff_id_idx").on(table.staffId),
    index("staff_ledger_entries_entry_date_idx").on(table.entryDate),
    index("staff_ledger_entries_category_idx").on(table.category),
  ],
);

export const staffPaySlips = pgTable(
  "staff_pay_slips",
  {
    id: text("id").primaryKey(),
    slipNumber: text("slip_number").notNull().unique(),
    staffId: text("staff_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    payPeriodStart: date("pay_period_start").notNull(),
    payPeriodEnd: date("pay_period_end").notNull(),
    issueDate: date("issue_date").notNull(),
    grossAmountPaise: bigint("gross_amount_paise", { mode: "number" }),
    netAmountPaise: bigint("net_amount_paise", { mode: "number" }),
    deductionsPaise: bigint("deductions_paise", { mode: "number" }),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    notes: text("notes"),
    uploadedByUserId: text("uploaded_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("staff_pay_slips_staff_id_idx").on(table.staffId),
    index("staff_pay_slips_issue_date_idx").on(table.issueDate),
  ],
);

export const staffMembersRelations = relations(staffMembers, ({ many }) => ({
  ledgerEntries: many(staffLedgerEntries),
  paySlips: many(staffPaySlips),
}));

export const staffLedgerEntriesRelations = relations(
  staffLedgerEntries,
  ({ one }) => ({
    staff: one(staffMembers, {
      fields: [staffLedgerEntries.staffId],
      references: [staffMembers.id],
    }),
  }),
);

export const staffPaySlipsRelations = relations(staffPaySlips, ({ one }) => ({
  staff: one(staffMembers, {
    fields: [staffPaySlips.staffId],
    references: [staffMembers.id],
  }),
}));