"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import {
  type InquiryListFilters,
  queryKeys,
} from "@/lib/query-keys";
import type { StudentInquiry } from "@/types/inquiry";

export function useInquiriesQuery(filters: InquiryListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    search: filters.search,
  });

  return useQuery({
    queryKey: queryKeys.inquiries(filters),
    queryFn: async () => {
      const res = await apiFetch<StudentInquiry[]>(
        `/api/students/inquiries${qs}`,
      );
      return res;
    },
  });
}

export function useInquiryQuery(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.inquiry(id) : ["inquiry", "none"],
    queryFn: async () => {
      if (!id) throw new Error("No inquiry id");
      return apiFetch<StudentInquiry>(`/api/students/inquiries/${id}`);
    },
    enabled: Boolean(id),
  });
}