"use client";

import { useSearchParams } from "next/navigation";

import { StudentRecordsPage } from "@/components/admin/students/student-records-page";

export function StudentRecordsPageClient() {
  const params = useSearchParams();
  const open = params.get("studentId");
  return <StudentRecordsPage initialOpenId={open} />;
}