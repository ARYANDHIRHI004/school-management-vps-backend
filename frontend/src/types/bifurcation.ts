export type StudentBifurcation = {
  id: string;
  studentId: string;
  fromClass: string | null;
  fromSection: string | null;
  fromStream: string | null;
  toClass: string;
  toSection: string | null;
  toStream: string | null;
  effectiveDate: string;
  reason: string | null;
  recordedByUserId: string | null;
  createdAt: string;
};

export type BifurcationStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string | null;
  registrationNumber: string | null;
  rollNumber: string | null;
};

export type BifurcationSearchRow = {
  bifurcation: StudentBifurcation;
  student: BifurcationStudentSummary;
};

export type CreateBifurcationInput = {
  studentId: string;
  fromClass?: string;
  fromSection?: string;
  fromStream?: string;
  toClass: string;
  toSection?: string;
  toStream?: string;
  effectiveDate: string;
  reason?: string;
};