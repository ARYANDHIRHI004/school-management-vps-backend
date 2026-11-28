import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import {
  academicYears,
  schoolClasses,
  schoolHouses,
  schoolSections,
} from "./academic.js";

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

/** Active / inactive / graduated (record status). */
export const studentRecordStatusEnum = pgEnum("student_record_status", [
  "active",
  "inactive",
  "graduated",
  "withdrawn",
]);

/** Current enrollment with the school. */
export const studentEnrollmentStatusEnum = pgEnum("student_enrollment_status", [
  "not_enrolled",
  "enrolled",
  "transferred",
  "graduated",
  "left",
]);

export const parentRelationshipEnum = pgEnum("parent_relationship", [
  "father",
  "mother",
  "guardian",
  "other",
]);

export const students = pgTable(
  "students",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    admissionNumber: text("admission_number").unique(),
    rollNumber: text("roll_number"),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth"),
    gender: text("gender"),
    bloodGroup: text("blood_group"),
    profilePhotoUrl: text("profile_photo"),
    recordStatus: studentRecordStatusEnum("status")
      .default("active")
      .notNull(),
    enrollmentStatus: studentEnrollmentStatusEnum("enrollment_status")
      .default("not_enrolled")
      .notNull(),
    email: text("email"),
    phone: text("phone"),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    /** @deprecated Prefer addressLine1 — kept for backward compatibility */
    address: text("address"),
    admissionDate: date("admission_date"),
    academicYearId: text("academic_year_id").references(() => academicYears.id, {
      onDelete: "set null",
    }),
    classId: text("class_id").references(() => schoolClasses.id, {
      onDelete: "set null",
    }),
    sectionId: text("section_id").references(() => schoolSections.id, {
      onDelete: "set null",
    }),
    houseId: text("house_id").references(() => schoolHouses.id, {
      onDelete: "set null",
    }),
    previousSchool: text("previous_school"),
    previousClass: text("previous_class"),
    /** Denormalized labels — used when lookup rows are not set */
    className: text("class_name"),
    section: text("section"),
    stream: text("stream"),
    academicYear: text("academic_year"),
    registrationNumber: text("registration_number").unique(),
    /** @deprecated Use student_parents — kept for quick display */
    fatherName: text("father_name"),
    motherName: text("mother_name"),
    lifecycleStatus: studentLifecycleStatusEnum("lifecycle_status")
      .default("inquiry")
      .notNull(),
    departedAt: date("departed_at"),
    departureReason: text("departure_reason"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedByUserId: text("updated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("students_user_id_idx").on(table.userId),
    index("students_lifecycle_status_idx").on(table.lifecycleStatus),
    index("students_record_status_idx").on(table.recordStatus),
    index("students_enrollment_status_idx").on(table.enrollmentStatus),
    index("students_class_section_stream_idx").on(
      table.className,
      table.section,
      table.stream,
    ),
    index("students_deleted_at_idx").on(table.deletedAt),
  ],
);

export const studentParents = pgTable(
  "student_parents",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    relationship: parentRelationshipEnum("relationship").notNull(),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    occupation: text("occupation"),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    isPrimaryContact: boolean("is_primary_contact").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("student_parents_student_id_idx").on(table.studentId),
    index("student_parents_relationship_idx").on(table.relationship),
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
  academicYear: one(academicYears, {
    fields: [students.academicYearId],
    references: [academicYears.id],
  }),
  schoolClass: one(schoolClasses, {
    fields: [students.classId],
    references: [schoolClasses.id],
  }),
  schoolSection: one(schoolSections, {
    fields: [students.sectionId],
    references: [schoolSections.id],
  }),
  schoolHouse: one(schoolHouses, {
    fields: [students.houseId],
    references: [schoolHouses.id],
  }),
  inquiries: many(studentInquiries),
  registrations: many(studentRegistrations),
  admissions: many(studentAdmissions),
  transferCertificates: many(transferCertificates),
  leavingCertificates: many(leavingCertificates),
  bifurcations: many(studentBifurcations),
  parents: many(studentParents),
}));

export const studentParentsRelations = relations(studentParents, ({ one }) => ({
  student: one(students, {
    fields: [studentParents.studentId],
    references: [students.id],
  }),
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