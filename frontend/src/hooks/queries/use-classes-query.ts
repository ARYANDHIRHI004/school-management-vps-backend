"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import type {
  ClassOverviewData,
  ClassSectionDetailData,
} from "@/types/classes";

export const classOverviewQueryKey = ["classOverview"] as const;

export function useClassOverviewQuery() {
  return useQuery({
    queryKey: classOverviewQueryKey,
    queryFn: async () => {
      const res = await apiFetch<ClassOverviewData>(
        "/api/students/classes/overview",
      );
      return res.data;
    },
    staleTime: 30_000,
  });
}

export type ClassSectionDetailFilters = {
  className: string;
  section: string;
  page: number;
  limit: number;
  search?: string;
};

export function useClassSectionDetailQuery(
  filters: ClassSectionDetailFilters | null,
) {
  const enabled = Boolean(filters?.className && filters.section);

  const qs = filters
    ? buildQuery({
        className: filters.className,
        section: filters.section,
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
      })
    : "";

  return useQuery({
    queryKey: ["classSectionDetail", filters],
    queryFn: async () => {
      if (!filters) throw new Error("Missing filters");
      const res = await apiFetch<ClassSectionDetailData>(
        `/api/students/classes/section${qs}`,
      );
      return { detail: res.data, meta: res.meta };
    },
    enabled,
  });
}