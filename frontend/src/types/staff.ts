export type StaffStatus = "active" | "inactive" | "resigned";
export type EmploymentType = "permanent" | "contract" | "part_time";
export type LedgerEntryType = "credit" | "debit";
export type LedgerCategory =
  | "opening_balance"
  | "salary_payment"
  | "advance"
  | "deduction"
  | "bonus"
  | "reimbursement"
  | "adjustment";

export type StaffMember = {
  id: string;
  staffCode: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string | null;
  employmentType: EmploymentType;
  isTeachingStaff: boolean;
  dateOfJoining: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  qualifications: string | null;
  subjectsTaught: string | null;
  baseSalaryPaise: number | null;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateStaffInput = {
  firstName: string;
  lastName: string;
  designation: string;
  department?: string;
  employmentType?: EmploymentType;
  isTeachingStaff?: boolean;
  dateOfJoining?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  qualifications?: string;
  subjectsTaught?: string;
  baseSalaryPaise?: number;
  staffCode?: string;
};

export type UpdateStaffInput = Partial<CreateStaffInput> & {
  status?: StaffStatus;
};

export type LedgerSummary = {
  totalCreditPaise: number;
  totalDebitPaise: number;
  balancePaise: number;
};

export type StaffLedgerEntry = {
  id: string;
  staffId: string;
  entryDate: string;
  entryType: LedgerEntryType;
  category: LedgerCategory;
  amountPaise: number;
  referenceNumber: string | null;
  description: string | null;
  recordedByUserId: string | null;
  createdAt: string;
  staff?: {
    staffCode: string;
    firstName: string;
    lastName: string;
  };
};

export type CreateLedgerEntryInput = {
  staffId: string;
  entryDate: string;
  entryType: LedgerEntryType;
  category: LedgerCategory;
  amountPaise: number;
  referenceNumber?: string;
  description?: string;
};

export type PaySlipRow = {
  id: string;
  slipNumber: string;
  staffId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  issueDate: string;
  grossAmountPaise: number | null;
  netAmountPaise: number | null;
  deductionsPaise: number | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  notes: string | null;
  createdAt: string;
  staff?: {
    staffCode: string;
    firstName: string;
    lastName: string;
  };
};