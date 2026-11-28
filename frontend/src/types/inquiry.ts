export type InquiryStatus = "open" | "converted" | "closed";

export type StudentInquiry = {
  id: string;
  inquiryNumber: string;
  studentId: string | null;
  inquirerName: string;
  email: string | null;
  phone: string | null;
  intendedClass: string | null;
  intendedStream: string | null;
  academicYear: string | null;
  notes: string | null;
  status: InquiryStatus;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInquiryInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  inquirerName: string;
  fatherName?: string;
  motherName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  intendedClass?: string;
  intendedStream?: string;
  academicYear?: string;
  notes?: string;
};

export type UpdateInquiryInput = {
  inquirerName?: string;
  email?: string;
  phone?: string;
  intendedClass?: string;
  intendedStream?: string;
  academicYear?: string;
  notes?: string;
  status?: InquiryStatus;
};

export type ConvertInquiryInput = {
  registrationDate: string;
  remarks?: string;
};

export type StudentRegistration = {
  id: string;
  registrationNumber: string;
  studentId: string;
  inquiryId: string | null;
  registrationDate: string;
  status: string;
  remarks: string | null;
};