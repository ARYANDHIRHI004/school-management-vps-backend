import { eq, getTableColumns } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  studentInquiries,
  studentRegistrations,
  students,
} from "../db/schema/students.js";

export const registrationWithRelationsSelect = {
  ...getTableColumns(studentRegistrations),
  studentFirstName: students.firstName,
  studentLastName: students.lastName,
  studentPhone: students.phone,
  studentEmail: students.email,
  studentClassName: students.className,
  studentStream: students.stream,
  studentAcademicYear: students.academicYear,
  studentLifecycleStatus: students.lifecycleStatus,
  inquiryNumber: studentInquiries.inquiryNumber,
  inquiryInquirerName: studentInquiries.inquirerName,
};

export type RegistrationWithRelationsRow = {
  id: string;
  registrationNumber: string;
  studentId: string;
  inquiryId: string | null;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
  remarks: string | null;
  registeredByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  studentFirstName: string | null;
  studentLastName: string | null;
  studentPhone: string | null;
  studentEmail: string | null;
  studentClassName: string | null;
  studentStream: string | null;
  studentAcademicYear: string | null;
  studentLifecycleStatus: string | null;
  inquiryNumber: string | null;
  inquiryInquirerName: string | null;
};

export function toRegistrationDto(row: RegistrationWithRelationsRow) {
  const hasStudent =
    row.studentFirstName != null && row.studentLastName != null;

  return {
    id: row.id,
    registrationNumber: row.registrationNumber,
    studentId: row.studentId,
    inquiryId: row.inquiryId,
    registrationDate: row.registrationDate,
    status: row.status,
    remarks: row.remarks,
    registeredByUserId: row.registeredByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    student: hasStudent
      ? {
          id: row.studentId,
          firstName: row.studentFirstName!,
          lastName: row.studentLastName!,
          phone: row.studentPhone,
          email: row.studentEmail,
          className: row.studentClassName,
          stream: row.studentStream,
          academicYear: row.studentAcademicYear,
          lifecycleStatus: row.studentLifecycleStatus,
        }
      : null,
    inquiry:
      row.inquiryId && row.inquiryNumber
        ? {
            id: row.inquiryId,
            inquiryNumber: row.inquiryNumber,
            inquirerName: row.inquiryInquirerName ?? "",
          }
        : null,
  };
}

export async function fetchRegistrationWithRelations(id: string) {
  const [row] = await db
    .select(registrationWithRelationsSelect)
    .from(studentRegistrations)
    .leftJoin(students, eq(studentRegistrations.studentId, students.id))
    .leftJoin(
      studentInquiries,
      eq(studentRegistrations.inquiryId, studentInquiries.id),
    )
    .where(eq(studentRegistrations.id, id))
    .limit(1);

  if (!row) return null;
  return toRegistrationDto(row as RegistrationWithRelationsRow);
}