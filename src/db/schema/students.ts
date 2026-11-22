import { relations } from "drizzle-orm";
import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const studentLifecycleStatusEnum = pgEnum("student_lifecycle_status", [
  "inquiry",
  "registered",
  "admitted",
  "transferred",
  "left",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "open",
  "converted",
  "closed",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "approved",
  "rejected",
]);

export const admissionStatusEnum = pgEnum("admission_status", [
  "active",
  "completed",
  "cancelled",
]);

export const students = pgTable(
  "students",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    fatherName: text("father_name"),
    motherName: text("mother_name"),
    email: text("email"),
    phone: text("phone"),
    gender: text("gender"),
    dateOfBirth: date("date_of_birth"),
    address: text("address"),
    className: text("class_name"),
    section: text("section"),
    stream: text("stream"),
    academicYear: text("academic_year"),
    rollNumber: text("roll_number"),
    registrationNumber: text("registration_number").unique(),
    admissionNumber: text("admission_number").unique(),
    lifecycleStatus: studentLifecycleStatusEnum("lifecycle_status")
      .default("inquiry")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("students_user_id_idx").on(table.userId),
    index("students_lifecycle_status_idx").on(table.lifecycleStatus),
    index("students_class_section_stream_idx").on(
      table.className,
      table.section,
      table.stream,
    ),
  ],
);

export const studentInquiries = pgTable(
  "student_inquiries",
  {
    id: text("id").primaryKey(),
    inquiryNumber: text("inquiry_number").notNull().unique(),
    studentId: text("student_id").references(() => students.id, {
      onDelete: "set null",
    }),
    inquirerName: text("inquirer_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    intendedClass: text("intended_class"),
    intendedStream: text("intended_stream"),
    academicYear: text("academic_year"),
    notes: text("notes"),
    status: inquiryStatusEnum("status").default("open").notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("student_inquiries_status_idx").on(table.status)],
);

export const studentRegistrations = pgTable(
  "student_registrations",
  {
    id: text("id").primaryKey(),
    registrationNumber: text("registration_number").notNull().unique(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    inquiryId: text("inquiry_id").references(() => studentInquiries.id, {
      onDelete: "set null",
    }),
    registrationDate: date("registration_date").notNull(),
    status: registrationStatusEnum("status").default("pending").notNull(),
    remarks: text("remarks"),
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
    index("student_registrations_student_id_idx").on(table.studentId),
    index("student_registrations_status_idx").on(table.status),
  ],
);

export const studentAdmissions = pgTable(
  "student_admissions",
  {
    id: text("id").primaryKey(),
    admissionNumber: text("admission_number").notNull().unique(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    registrationId: text("registration_id").references(
      () => studentRegistrations.id,
      { onDelete: "set null" },
    ),
    admissionDate: date("admission_date").notNull(),
    className: text("class_name").notNull(),
    section: text("section"),
    stream: text("stream"),
    academicYear: text("academic_year"),
    status: admissionStatusEnum("status").default("active").notNull(),
    admittedByUserId: text("admitted_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("student_admissions_student_id_idx").on(table.studentId),
    index("student_admissions_status_idx").on(table.status),
  ],
);

export const transferCertificates = pgTable(
  "transfer_certificates",
  {
    id: text("id").primaryKey(),
    certificateNumber: text("certificate_number").notNull().unique(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    issueDate: date("issue_date").notNull(),
    reason: text("reason"),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
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
    index("transfer_certificates_student_id_idx").on(table.studentId),
  ],
);

export const leavingCertificates = pgTable(
  "leaving_certificates",
  {
    id: text("id").primaryKey(),
    certificateNumber: text("certificate_number").notNull().unique(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    issueDate: date("issue_date").notNull(),
    reason: text("reason"),
    lastClassAttended: text("last_class_attended"),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
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
    index("leaving_certificates_student_id_idx").on(table.studentId),
  ],
);

export const studentBifurcations = pgTable(
  "student_bifurcations",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    fromClass: text("from_class"),
    fromSection: text("from_section"),
    fromStream: text("from_stream"),
    toClass: text("to_class").notNull(),
    toSection: text("to_section"),
    toStream: text("to_stream"),
    effectiveDate: date("effective_date").notNull(),
    reason: text("reason"),
    recordedByUserId: text("recorded_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("student_bifurcations_student_id_idx").on(table.studentId),
    index("student_bifurcations_to_stream_idx").on(table.toStream),
    index("student_bifurcations_effective_date_idx").on(table.effectiveDate),
  ],
);

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(user, { fields: [students.userId], references: [user.id] }),
  inquiries: many(studentInquiries),
  registrations: many(studentRegistrations),
  admissions: many(studentAdmissions),
  transferCertificates: many(transferCertificates),
  leavingCertificates: many(leavingCertificates),
  bifurcations: many(studentBifurcations),
}));

export const studentInquiriesRelations = relations(
  studentInquiries,
  ({ one }) => ({
    student: one(students, {
      fields: [studentInquiries.studentId],
      references: [students.id],
    }),
  }),
);

export const studentRegistrationsRelations = relations(
  studentRegistrations,
  ({ one }) => ({
    student: one(students, {
      fields: [studentRegistrations.studentId],
      references: [students.id],
    }),
    inquiry: one(studentInquiries, {
      fields: [studentRegistrations.inquiryId],
      references: [studentInquiries.id],
    }),
  }),
);

export const studentAdmissionsRelations = relations(
  studentAdmissions,
  ({ one }) => ({
    student: one(students, {
      fields: [studentAdmissions.studentId],
      references: [students.id],
    }),
    registration: one(studentRegistrations, {
      fields: [studentAdmissions.registrationId],
      references: [studentRegistrations.id],
    }),
  }),
);

export const transferCertificatesRelations = relations(
  transferCertificates,
  ({ one }) => ({
    student: one(students, {
      fields: [transferCertificates.studentId],
      references: [students.id],
    }),
  }),
);

export const leavingCertificatesRelations = relations(
  leavingCertificates,
  ({ one }) => ({
    student: one(students, {
      fields: [leavingCertificates.studentId],
      references: [students.id],
    }),
  }),
);

export const studentBifurcationsRelations = relations(
  studentBifurcations,
  ({ one }) => ({
    student: one(students, {
      fields: [studentBifurcations.studentId],
      references: [students.id],
    }),
  }),
);