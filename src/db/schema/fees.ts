import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { students } from "./students.js";

export const feeDueStatusEnum = pgEnum("fee_due_status", [
  "pending",
  "partial",
  "paid",
  "overdue",
  "waived",
]);

export const feePaymentModeEnum = pgEnum("fee_payment_mode", [
  "cash",
  "cheque",
  "bank_transfer",
  "upi_offline",
  "other",
]);

export const feeCollectionStatusEnum = pgEnum("fee_collection_status", [
  "completed",
  "voided",
]);

export const feeAlertTypeEnum = pgEnum("fee_alert_type", [
  "due_reminder",
  "overdue",
  "payment_received",
  "custom",
]);

export const feeAlertSeverityEnum = pgEnum("fee_alert_severity", [
  "info",
  "warning",
  "critical",
]);

export const feeAlertStatusEnum = pgEnum("fee_alert_status", [
  "unread",
  "read",
  "dismissed",
]);

export const feeAlertSmsStatusEnum = pgEnum("fee_alert_sms_status", [
  "pending",
  "sent",
  "failed",
  "skipped",
]);

export const feeHeads = pgTable(
  "fee_heads",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: integer("is_active").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("fee_heads_is_active_idx").on(table.isActive)],
);

export const studentFeeDues = pgTable(
  "student_fee_dues",
  {
    id: text("id").primaryKey(),
    dueNumber: text("due_number").notNull().unique(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    academicYear: text("academic_year"),
    term: text("term"),
    dueDate: date("due_date").notNull(),
    status: feeDueStatusEnum("status").default("pending").notNull(),
    totalAmountPaise: bigint("total_amount_paise", { mode: "number" }).notNull(),
    paidAmountPaise: bigint("paid_amount_paise", { mode: "number" })
      .default(0)
      .notNull(),
    notes: text("notes"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("student_fee_dues_student_id_idx").on(table.studentId),
    index("student_fee_dues_status_idx").on(table.status),
    index("student_fee_dues_due_date_idx").on(table.dueDate),
  ],
);

export const studentFeeDueItems = pgTable(
  "student_fee_due_items",
  {
    id: text("id").primaryKey(),
    dueId: text("due_id")
      .notNull()
      .references(() => studentFeeDues.id, { onDelete: "cascade" }),
    feeHeadId: text("fee_head_id").references(() => feeHeads.id, {
      onDelete: "set null",
    }),
    label: text("label").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
  },
  (table) => [index("student_fee_due_items_due_id_idx").on(table.dueId)],
);

export const feeCollections = pgTable(
  "fee_collections",
  {
    id: text("id").primaryKey(),
    collectionNumber: text("collection_number").notNull().unique(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    collectionDate: date("collection_date").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    paymentMode: feePaymentModeEnum("payment_mode").notNull(),
    referenceNumber: text("reference_number"),
    remarks: text("remarks"),
    status: feeCollectionStatusEnum("status").default("completed").notNull(),
    collectedByUserId: text("collected_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("fee_collections_student_id_idx").on(table.studentId),
    index("fee_collections_collection_date_idx").on(table.collectionDate),
  ],
);

export const feeCollectionAllocations = pgTable(
  "fee_collection_allocations",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id")
      .notNull()
      .references(() => feeCollections.id, { onDelete: "cascade" }),
    dueId: text("due_id")
      .notNull()
      .references(() => studentFeeDues.id, { onDelete: "cascade" }),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
  },
  (table) => [
    index("fee_collection_allocations_collection_id_idx").on(
      table.collectionId,
    ),
    index("fee_collection_allocations_due_id_idx").on(table.dueId),
  ],
);

export const feeReceipts = pgTable(
  "fee_receipts",
  {
    id: text("id").primaryKey(),
    receiptNumber: text("receipt_number").notNull().unique(),
    collectionId: text("collection_id")
      .notNull()
      .unique()
      .references(() => feeCollections.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    issueDate: date("issue_date").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    paymentMode: feePaymentModeEnum("payment_mode").notNull(),
    referenceNumber: text("reference_number"),
    remarks: text("remarks"),
    issuedByUserId: text("issued_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("fee_receipts_student_id_idx").on(table.studentId),
    index("fee_receipts_issue_date_idx").on(table.issueDate),
  ],
);

export const feePaymentAlerts = pgTable(
  "fee_payment_alerts",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    dueId: text("due_id").references(() => studentFeeDues.id, {
      onDelete: "cascade",
    }),
    alertType: feeAlertTypeEnum("alert_type").notNull(),
    severity: feeAlertSeverityEnum("severity").default("info").notNull(),
    status: feeAlertStatusEnum("status").default("unread").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    scheduledFor: date("scheduled_for"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    readAt: timestamp("read_at"),
    dismissedAt: timestamp("dismissed_at"),
    smsStatus: feeAlertSmsStatusEnum("sms_status").default("pending").notNull(),
    smsMessageId: text("sms_message_id"),
    smsError: text("sms_error"),
    smsSentAt: timestamp("sms_sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("fee_payment_alerts_student_id_idx").on(table.studentId),
    index("fee_payment_alerts_status_idx").on(table.status),
    index("fee_payment_alerts_alert_type_idx").on(table.alertType),
  ],
);

export const feeHeadsRelations = relations(feeHeads, ({ many }) => ({
  dueItems: many(studentFeeDueItems),
}));

export const studentFeeDuesRelations = relations(
  studentFeeDues,
  ({ one, many }) => ({
    student: one(students, {
      fields: [studentFeeDues.studentId],
      references: [students.id],
    }),
    items: many(studentFeeDueItems),
    allocations: many(feeCollectionAllocations),
    alerts: many(feePaymentAlerts),
  }),
);

export const studentFeeDueItemsRelations = relations(
  studentFeeDueItems,
  ({ one }) => ({
    due: one(studentFeeDues, {
      fields: [studentFeeDueItems.dueId],
      references: [studentFeeDues.id],
    }),
    feeHead: one(feeHeads, {
      fields: [studentFeeDueItems.feeHeadId],
      references: [feeHeads.id],
    }),
  }),
);

export const feeCollectionsRelations = relations(
  feeCollections,
  ({ one, many }) => ({
    student: one(students, {
      fields: [feeCollections.studentId],
      references: [students.id],
    }),
    allocations: many(feeCollectionAllocations),
    receipt: one(feeReceipts, {
      fields: [feeCollections.id],
      references: [feeReceipts.collectionId],
    }),
  }),
);

export const feeCollectionAllocationsRelations = relations(
  feeCollectionAllocations,
  ({ one }) => ({
    collection: one(feeCollections, {
      fields: [feeCollectionAllocations.collectionId],
      references: [feeCollections.id],
    }),
    due: one(studentFeeDues, {
      fields: [feeCollectionAllocations.dueId],
      references: [studentFeeDues.id],
    }),
  }),
);

export const feeReceiptsRelations = relations(feeReceipts, ({ one }) => ({
  collection: one(feeCollections, {
    fields: [feeReceipts.collectionId],
    references: [feeCollections.id],
  }),
  student: one(students, {
    fields: [feeReceipts.studentId],
    references: [students.id],
  }),
}));

export const feePaymentAlertsRelations = relations(
  feePaymentAlerts,
  ({ one }) => ({
    student: one(students, {
      fields: [feePaymentAlerts.studentId],
      references: [students.id],
    }),
    due: one(studentFeeDues, {
      fields: [feePaymentAlerts.dueId],
      references: [studentFeeDues.id],
    }),
  }),
);