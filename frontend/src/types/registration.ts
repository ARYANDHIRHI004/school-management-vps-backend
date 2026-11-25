export type RegistrationStatus = "pending" | "approved" | "rejected";

export type RegistrationStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  className: string | null;
  stream: string | null;
  academicYear: string | null;
  lifecycleStatus: string | null;
};

export type RegistrationInquirySummary = {
  id: string;
  inquiryNumber: string;
  inquirerName: string;
};

export type StudentRegistration = {
  id: string;
  registrationNumber: string;
  studentId: string;
  inquiryId: string | null;
  registrationDate: string;
  status: RegistrationStatus;
  remarks: string | null;
  registeredByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  student?: RegistrationStudentSummary | null;
  inquiry?: RegistrationInquirySummary | null;
};

export type CreateRegistrationInput = {
  studentId: string;
  inquiryId?: string;
  registrationDate: string;
  remarks?: string;
};

export type UpdateRegistrationInput = {
  status?: RegistrationStatus;
  remarks?: string;
  registrationDate?: string;
};