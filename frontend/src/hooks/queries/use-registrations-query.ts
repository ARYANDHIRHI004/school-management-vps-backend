"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import {
  type RegistrationListFilters,
  queryKeys,
} from "@/lib/query-keys";
import type { StudentRegistration } from "@/types/registration";

export function useRegistrationsQuery(filters: RegistrationListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    search: filters.search,
  });

  return useQuery({
    queryKey: queryKeys.registrations(filters),
    queryFn: () =>
      apiFetch<StudentRegistration[]>(`/api/students/registrations${qs}`),
  });
}

export function useRegistrationQuery(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.registration(id) : ["registration", "none"],
    queryFn: async () => {
      if (!id) throw new Error("No registration id");
      return apiFetch<StudentRegistration>(`/api/students/registrations/${id}`);
    },
    enabled: Boolean(id),
  });
}