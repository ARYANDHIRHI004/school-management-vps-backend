export type CertificateStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string | null;
  rollNumber: string | null;
};

export type TransferCertificateRow = {
  id: string;
  certificateNumber: string;
  studentId: string;
  issueDate: string;
  reason: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  student?: CertificateStudentSummary;
};

export type LeavingCertificateRow = TransferCertificateRow & {
  lastClassAttended: string | null;
};

export type UploadCertificateMeta = {
  studentId: string;
  issueDate: string;
  reason?: string;
  certificateNumber?: string;
};

export type UploadLeavingCertificateMeta = UploadCertificateMeta & {
  lastClassAttended?: string;
};