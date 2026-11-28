import { z } from "zod";
import { paginationQuerySchema } from "./common.validator.js";

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .optional();

const requiredDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const studentProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100),
  fatherName: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
  email: z.email().optional(),
  phone: z.string().min(6).max(20).optional(),
  gender: z.string().max(30).optional(),
  dateOfBirth: optionalDate,
  address: z.string().max(500).optional(),
  className: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  stream: z.string().max(50).optional(),
  academicYear: z.string().max(20).optional(),
  rollNumber: z.string().max(50).optional(),
  userId: z.string().min(1).optional(),
});

export const createInquirySchema = studentProfileSchema.extend({
  inquirerName: z.string().min(1).max(150),
  intendedClass: z.string().max(50).optional(),
  intendedStream: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

/** Landing page admission form (unauthenticated). */
export const publicInquirySchema = z.object({
  studentName: z.string().min(1).max(200),
  intendedClass: z.string().min(1).max(50),
  phone: z.string().min(6).max(20),
});

export const updateInquirySchema = z.object({
  inquirerName: z.string().min(1).max(150).optional(),
  email: z.email().optional(),
  phone: z.string().min(6).max(20).optional(),
  intendedClass: z.string().max(50).optional(),
  intendedStream: z.string().max(50).optional(),
  academicYear: z.string().max(20).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(["open", "converted", "closed"]).optional(),
});

export const inquiryListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["open", "converted", "closed"]).optional(),
  search: z.string().max(100).optional(),
});

export const convertInquirySchema = z.object({
  registrationDate: requiredDate,
  remarks: z.string().max(500).optional(),
});

export const createRegistrationSchema = z.object({
  studentId: z.string().min(1),
  inquiryId: z.string().min(1).optional(),
  registrationDate: requiredDate,
  remarks: z.string().max(500).optional(),
});

export const updateRegistrationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  remarks: z.string().max(500).optional(),
  registrationDate: requiredDate.optional(),
});

export const registrationListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  studentId: z.string().min(1).optional(),
  search: z.string().max(100).optional(),
});

const portalAccessSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

export const createAdmissionSchema = z.object({
  studentId: z.string().min(1),
  registrationId: z.string().min(1).optional(),
  admissionDate: requiredDate,
  admissionNumber: z.string().trim().min(1).max(50),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  stream: z.string().max(50).optional(),
  academicYear: z.string().max(20).optional(),
  portalAccess: portalAccessSchema.optional(),
});

export const provisionPortalAccessSchema = portalAccessSchema;

export const updateAdmissionSchema = z
  .object({
    status: z.enum(["active", "completed", "cancelled"]).optional(),
    classId: z.string().min(1).optional(),
    sectionId: z.string().min(1).optional(),
    stream: z.string().max(50).optional(),
    academicYear: z.string().max(20).optional(),
  })
  .refine(
    (data) =>
      (data.classId === undefined) === (data.sectionId === undefined),
    {
      message: "classId and sectionId must be sent together",
      path: ["sectionId"],
    },
  );

export const admissionListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  studentId: z.string().min(1).optional(),
  search: z.string().max(100).optional(),
  lifecycle: z
    .enum(["inquiry", "registered", "admitted", "transferred", "left"])
    .optional(),
});

export const markStudentDepartureSchema = z.object({
  studentId: z.string().min(1),
  departureType: z.enum(["left", "transferred"]),
  departedAt: requiredDate,
  reason: z.string().max(500).optional(),
});

export const departedStudentsListQuerySchema = paginationQuerySchema.extend({
  departureType: z.enum(["left", "transferred"]).optional(),
});

export const studentRecordsListQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(100).optional(),
  className: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  lifecycle: z
    .enum(["inquiry", "registered", "admitted", "transferred", "left"])
    .optional(),
  enrollmentStatus: z
    .enum(["not_enrolled", "enrolled", "transferred", "graduated", "left"])
    .optional(),
  recordStatus: z
    .enum(["active", "inactive", "graduated", "withdrawn"])
    .optional(),
});

export const schoolSectionsQuerySchema = z.object({
  classId: z.string().min(1).optional(),
});

export const classSectionDetailQuerySchema = paginationQuerySchema.extend({
  className: z.string().min(1).max(50),
  section: z.string().min(1).max(50),
  search: z.string().max(100).optional(),
});

export const assignSectionStaffSchema = z.object({
  className: z.string().min(1).max(50),
  section: z.string().min(1).max(50),
  staffId: z.string().min(1),
  role: z.enum(["class_teacher", "subject_teacher", "assistant"]).optional(),
  subject: z.string().max(100).optional(),
});

export const uploadCertificateMetaSchema = z.object({
  studentId: z.string().min(1),
  issueDate: requiredDate,
  reason: z.string().max(500).optional(),
  certificateNumber: z.string().min(1).max(50).optional(),
});

export const uploadLeavingCertificateMetaSchema = uploadCertificateMetaSchema.extend({
  lastClassAttended: z.string().max(50).optional(),
});

export const certificateListQuerySchema = paginationQuerySchema.extend({
  studentId: z.string().min(1).optional(),
});

export const createBifurcationSchema = z.object({
  studentId: z.string().min(1),
  fromClass: z.string().max(50).optional(),
  fromSection: z.string().max(50).optional(),
  fromStream: z.string().max(50).optional(),
  toClass: z.string().min(1).max(50),
  toSection: z.string().max(50).optional(),
  toStream: z.string().max(50).optional(),
  effectiveDate: requiredDate,
  reason: z.string().max(500).optional(),
});

export const bifurcationSearchQuerySchema = paginationQuerySchema.extend({
  studentId: z.string().min(1).optional(),
  className: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  stream: z.string().max(50).optional(),
  fromDate: optionalDate,
  toDate: optionalDate,
  search: z.string().max(100).optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const linkStudentUserSchema = z.object({
  userId: z.string().min(1),
});

const optionalId = z.string().min(1).optional();

export const updateStudentRecordSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: optionalDate,
  gender: z.string().max(30).optional(),
  bloodGroup: z.string().max(10).optional(),
  profilePhotoUrl: z.string().max(2000).optional(),
  recordStatus: z
    .enum(["active", "inactive", "graduated", "withdrawn"])
    .optional(),
  email: z.email().optional(),
  phone: z.string().min(6).max(20).optional(),
  rollNumber: z.string().max(50).optional(),
  addressLine1: z.string().max(500).optional(),
  addressLine2: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  admissionDate: optionalDate,
  academicYearId: optionalId,
  classId: optionalId,
  sectionId: optionalId,
  houseId: optionalId,
  className: z.string().max(50).optional(),
  section: z.string().max(50).optional(),
  stream: z.string().max(50).optional(),
  academicYear: z.string().max(20).optional(),
  previousSchool: z.string().max(200).optional(),
  previousClass: z.string().max(50).optional(),
  fatherName: z.string().max(100).optional(),
  motherName: z.string().max(100).optional(),
});

export const studentParentBodySchema = z.object({
  relationship: z.enum(["father", "mother", "guardian", "other"]),
  firstName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.email().optional(),
  phone: z.string().min(6).max(20).optional(),
  occupation: z.string().max(100).optional(),
  addressLine1: z.string().max(500).optional(),
  addressLine2: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  isPrimaryContact: z.boolean().optional(),
});

export const studentParentIdParamSchema = z.object({
  parentId: z.string().min(1),
});

export const updateStudentParentSchema = studentParentBodySchema.partial();