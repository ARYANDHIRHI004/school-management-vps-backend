export type SchoolSection = {
  id: string;
  classId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SchoolClass = {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  sections: SchoolSection[];
};