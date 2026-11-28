export type ClassSectionSummary = {
  id: string | null;
  name: string;
  studentCount: number;
};

export type ClassOverviewItem = {
  id: string | null;
  name: string;
  totalStudents: number;
  sections: ClassSectionSummary[];
};

export type ClassOverviewData = {
  classes: ClassOverviewItem[];
};

export type SectionTeacher = {
  id: string;
  role: string;
  subject: string | null;
  staffId: string;
  staffCode: string;
  firstName: string;
  lastName: string;
  designation: string;
  phone: string | null;
  email: string | null;
};

export type SectionStudentRow = {
  id: string;
  admissionNumber: string | null;
  rollNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  enrollmentStatus: string;
  lifecycleStatus: string;
};

export type ClassSectionDetailData = {
  className: string;
  section: string;
  teachers: SectionTeacher[];
  students: SectionStudentRow[];
};