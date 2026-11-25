"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import { type AdmissionListFilters, queryKeys } from "@/lib/query-keys";
import type { StudentAdmission } from "@/types/admission";

export function useAdmissionsQuery(filters: AdmissionListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    search: filters.search,
  });

  return useQuery({
    queryKey: queryKeys.admissions(filters),
    queryFn: () =>
      apiFetch<StudentAdmission[]>(`/api/students/admissions${qs}`),
  });
}

export function useAdmissionQuery(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.admission(id) : ["admission", "none"],
    queryFn: async () => {
      if (!id) throw new Error("No admission id");
      return apiFetch<StudentAdmission>(`/api/students/admissions/${id}`);
    },
    enabled: Boolean(id),
  });
}