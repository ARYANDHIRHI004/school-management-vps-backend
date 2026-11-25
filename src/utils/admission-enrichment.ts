import { eq, getTableColumns } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  studentAdmissions,
  studentRegistrations,
  students,
} from "../db/schema/students.js";

export const admissionWithRelationsSelect = {
  ...getTableColumns(studentAdmissions),
  studentFirstName: students.firstName,
  studentLastName: students.lastName,
  studentPhone: students.phone,
  studentEmail: students.email,
  studentLifecycleStatus: students.lifecycleStatus,
  registrationNumber: studentRegistrations.registrationNumber,
};

export type AdmissionWithRelationsRow = {
  id: string;
  admissionNumber: string;
  studentId: string;
  registrationId: string | null;
  admissionDate: string;
  className: string;
  section: string | null;
  stream: string | null;
  academicYear: string | null;
  status: "active" | "completed" | "cancelled";
  admittedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  studentFirstName: string | null;
  studentLastName: string | null;
  studentPhone: string | null;
  studentEmail: string | null;
  studentLifecycleStatus: string | null;
  registrationNumber: string | null;
};

export function toAdmissionDto(row: AdmissionWithRelationsRow) {
  const hasStudent =
    row.studentFirstName != null && row.studentLastName != null;

  return {
    id: row.id,
    admissionNumber: row.admissionNumber,
    studentId: row.studentId,
    registrationId: row.registrationId,
    admissionDate: row.admissionDate,
    className: row.className,
    section: row.section,
    stream: row.stream,
    academicYear: row.academicYear,
    status: row.status,
    admittedByUserId: row.admittedByUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    student: hasStudent
      ? {
          id: row.studentId,
          firstName: row.studentFirstName!,
          lastName: row.studentLastName!,
          phone: row.studentPhone,
          email: row.studentEmail,
          lifecycleStatus: row.studentLifecycleStatus,
        }
      : null,
    registration:
      row.registrationId && row.registrationNumber
        ? {
            id: row.registrationId,
            registrationNumber: row.registrationNumber,
          }
        : null,
  };
}

export async function fetchAdmissionWithRelations(id: string) {
  const [row] = await db
    .select(admissionWithRelationsSelect)
    .from(studentAdmissions)
    .leftJoin(students, eq(studentAdmissions.studentId, students.id))
    .leftJoin(
      studentRegistrations,
      eq(studentAdmissions.registrationId, studentRegistrations.id),
    )
    .where(eq(studentAdmissions.id, id))
    .limit(1);

  if (!row) return null;
  return toAdmissionDto(row as AdmissionWithRelationsRow);
}