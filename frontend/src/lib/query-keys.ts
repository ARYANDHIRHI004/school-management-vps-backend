import type { LedgerCategory } from "@/types/staff";

export const queryKeys = {
  session: ["session"] as const,
  health: ["health"] as const,
  inquiries: (filters: InquiryListFilters) =>
    ["inquiries", filters] as const,
  inquiry: (id: string) => ["inquiry", id] as const,
  registrations: (filters: RegistrationListFilters) =>
    ["registrations", filters] as const,
  registration: (id: string) => ["registration", id] as const,
  admissions: (filters: AdmissionListFilters) =>
    ["admissions", filters] as const,
  admission: (id: string) => ["admission", id] as const,
  studentRecords: (filters: StudentRecordsListFilters) =>
    ["studentRecords", filters] as const,
  studentProfile: (id: string) => ["studentProfile", id] as const,
  studentClassSectionOptions: ["studentClassSectionOptions"] as const,
  academicOptions: ["academicOptions"] as const,
  bifurcations: (filters: BifurcationListFilters) =>
    ["bifurcations", filters] as const,
  transferCertificates: (filters: CertificateListFilters) =>
    ["transferCertificates", filters] as const,
  leavingCertificates: (filters: CertificateListFilters) =>
    ["leavingCertificates", filters] as const,
  staff: (filters: StaffListFilters) => ["staff", filters] as const,
  staffMember: (id: string) => ["staffMember", id] as const,
  ledgerEntries: (filters: LedgerListFilters) =>
    ["ledgerEntries", filters] as const,
  paySlips: (filters: PaySlipListFilters) => ["paySlips", filters] as const,
};

export type StaffListFilters = {
  page: number;
  limit: number;
  status?: "active" | "inactive" | "resigned";
  department?: string;
  designation?: string;
  isTeachingStaff?: boolean;
  search?: string;
};

export type LedgerListFilters = {
  page: number;
  limit: number;
  staffId?: string;
  category?: LedgerCategory;
  entryType?: "credit" | "debit";
  fromDate?: string;
  toDate?: string;
};

export type PaySlipListFilters = {
  page: number;
  limit: number;
  staffId?: string;
  fromDate?: string;
  toDate?: string;
};

export type CertificateListFilters = {
  page: number;
  limit: number;
  studentId?: string;
};

export type BifurcationListFilters = {
  page: number;
  limit: number;
  studentId?: string;
  className?: string;
  section?: string;
  stream?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
};

export type StudentRecordsListFilters = {
  page: number;
  limit: number;
  search?: string;
  className?: string;
  section?: string;
  lifecycle?: StudentLifecycleFilter;
  enrollmentStatus?: StudentEnrollmentFilter;
  recordStatus?: StudentRecordStatusFilter;
};

export type StudentLifecycleFilter =
  | "inquiry"
  | "registered"
  | "admitted"
  | "transferred"
  | "left";

export type StudentEnrollmentFilter =
  | "not_enrolled"
  | "enrolled"
  | "transferred"
  | "graduated"
  | "left";

export type StudentRecordStatusFilter =
  | "active"
  | "inactive"
  | "graduated"
  | "withdrawn";

export type AdmissionListFilters = {
  page: number;
  limit: number;
  status?: "active" | "completed" | "cancelled";
  search?: string;
  lifecycle?:
    | "inquiry"
    | "registered"
    | "admitted"
    | "transferred"
    | "left";
};

export type RegistrationListFilters = {
  page: number;
  limit: number;
  status?: "pending" | "approved" | "rejected";
  search?: string;
};

export type InquiryListFilters = {
  page: number;
  limit: number;
  status?: "open" | "converted" | "closed";
  search?: string;
};