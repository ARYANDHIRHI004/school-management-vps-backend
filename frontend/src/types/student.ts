export type StudentLifecycleStatus =
  | "inquiry"
  | "registered"
  | "admitted"
  | "transferred"
  | "left";

export type StudentRecordStatus =
  | "active"
  | "inactive"
  | "graduated"
  | "withdrawn";

export type StudentEnrollmentStatus =
  | "not_enrolled"
  | "enrolled"
  | "transferred"
  | "graduated"
  | "left";

export type ParentRelationship = "father" | "mother" | "guardian" | "other";

export type StudentRecord = {
  id: string;
  userId: string | null;
  admissionNumber: string | null;
  rollNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  profilePhotoUrl: string | null;
  recordStatus: StudentRecordStatus;
  enrollmentStatus: StudentEnrollmentStatus;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  address: string | null;
  admissionDate: string | null;
  academicYearId: string | null;
  classId: string | null;
  sectionId: string | null;
  houseId: string | null;
  className: string | null;
  section: string | null;
  stream: string | null;
  academicYear: string | null;
  previousSchool: string | null;
  previousClass: string | null;
  registrationNumber: string | null;
  fatherName: string | null;
  motherName: string | null;
  lifecycleStatus: StudentLifecycleStatus;
  departedAt: string | null;
  departureReason: string | null;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudentParent = {
  id: string;
  studentId: string;
  relationship: ParentRelationship;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isPrimaryContact: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StudentProfilePayload = {
  student: StudentRecord;
  parents: StudentParent[];
};

export type UpdateStudentRecordInput = Partial<{
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  profilePhotoUrl: string;
  recordStatus: StudentRecordStatus;
  email: string;
  phone: string;
  rollNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  admissionDate: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  houseId: string;
  className: string;
  section: string;
  stream: string;
  academicYear: string;
  previousSchool: string;
  previousClass: string;
  fatherName: string;
  motherName: string;
}>;

export type StudentParentInput = {
  relationship: ParentRelationship;
  firstName: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimaryContact?: boolean;
};

export type MarkStudentDepartureInput = {
  studentId: string;
  departureType: "left" | "transferred";
  departedAt: string;
  reason?: string;
};

export type AcademicYear = {
  id: string;
  code: string;
  label: string;
  startsOn: string | null;
  endsOn: string | null;
  isCurrent: boolean;
};

export type SchoolClass = {
  id: string;
  name: string;
  sortOrder: number;
};

export type SchoolSection = {
  id: string;
  classId: string;
  name: string;
};

export type SchoolHouse = {
  id: string;
  name: string;
  color: string | null;
};

export type AcademicOptions = {
  years: AcademicYear[];
  classes: SchoolClass[];
  sections: SchoolSection[];
  houses: SchoolHouse[];
};

export type StudentPortalInquiry = {
  id: string;
  inquiryNumber: string;
  inquirerName: string;
  intendedClass: string | null;
  status: string;
  createdAt: string;
};

export type StudentPortalRegistration = {
  id: string;
  registrationNumber: string;
  registrationDate: string;
  status: string;
  remarks: string | null;
  createdAt: string;
};

export type StudentPortalAdmission = {
  id: string;
  admissionNumber: string;
  admissionDate: string;
  className: string;
  section: string | null;
  stream: string | null;
  academicYear: string | null;
  status: string;
  createdAt: string;
};

export type MyStudentPortalData = {
  student: StudentRecord;
  parents: StudentParent[];
  inquiry: StudentPortalInquiry | null;
  registration: StudentPortalRegistration | null;
  admission: StudentPortalAdmission | null;
};