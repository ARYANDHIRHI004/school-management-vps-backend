"use client";

import { useSearchParams } from "next/navigation";

import { ClassesPage } from "@/components/admin/classes/classes-page";

export function ClassesPageClient() {
  const params = useSearchParams();
  const studentId = params.get("studentId");
  return <ClassesPage initialOpenStudentId={studentId} />;
}