"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import { type StudentRecordsListFilters, queryKeys } from "@/lib/query-keys";
import type {
  AcademicOptions,
  StudentProfilePayload,
  StudentRecord,
} from "@/types/student";

export function useStudentRecordsQuery(filters: StudentRecordsListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    className: filters.className,
    section: filters.section,
    lifecycle: filters.lifecycle,
    enrollmentStatus: filters.enrollmentStatus,
    recordStatus: filters.recordStatus,
  });

  return useQuery({
    queryKey: queryKeys.studentRecords(filters),
    queryFn: () =>
      apiFetch<StudentRecord[]>(`/api/students/records${qs}`),
  });
}

export function useStudentProfileQuery(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.studentProfile(id) : ["studentProfile", "none"],
    queryFn: async () => {
      if (!id) throw new Error("No student id");
      const res = await apiFetch<StudentProfilePayload>(
        `/api/students/profile/${id}`,
      );
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useStudentClassSectionOptionsQuery() {
  return useQuery({
    queryKey: queryKeys.studentClassSectionOptions,
    queryFn: async () => {
      const res = await apiFetch<{ classes: string[]; sections: string[] }>(
        "/api/students/records/class-section-options",
      );
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useAcademicOptionsQuery() {
  return useQuery({
    queryKey: queryKeys.academicOptions,
    queryFn: async () => {
      const res = await apiFetch<AcademicOptions>(
        "/api/students/academic-options",
      );
      return res.data;
    },
    staleTime: 60_000,
  });
}