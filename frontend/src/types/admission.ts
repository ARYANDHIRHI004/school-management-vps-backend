export type AdmissionStatus = "active" | "completed" | "cancelled";

export type AdmissionStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  lifecycleStatus: string | null;
  enrollmentStatus?: string | null;
  recordStatus?: string | null;
  departedAt?: string | null;
  departureReason?: string | null;
};

export type AdmissionRegistrationSummary = {
  id: string;
  registrationNumber: string;
};

export type StudentAdmission = {
  id: string;
  admissionNumber: string;
  studentId: string;
  registrationId: string | null;
  admissionDate: string;
  className: string;
  section: string | null;
  stream: string | null;
  academicYear: string | null;
  status: AdmissionStatus;
  admittedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  student?: AdmissionStudentSummary | null;
  registration?: AdmissionRegistrationSummary | null;
};

export type PortalAccessInput = {
  email: string;
  password: string;
  name?: string;
};

export type CreateAdmissionInput = {
  studentId: string;
  registrationId?: string;
  admissionDate: string;
  admissionNumber: string;
  classId: string;
  sectionId: string;
  stream?: string;
  academicYear?: string;
  portalAccess?: PortalAccessInput;
};

export type UpdateAdmissionInput = {
  status?: AdmissionStatus;
  classId?: string;
  sectionId?: string;
  stream?: string;
  academicYear?: string;
};

export type CreateAdmissionResult = {
  admission: StudentAdmission;
  portal: { userId: string; email: string } | null;
};