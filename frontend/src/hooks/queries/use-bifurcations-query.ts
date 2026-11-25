"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import {
  type BifurcationListFilters,
  queryKeys,
} from "@/lib/query-keys";
import type { BifurcationSearchRow } from "@/types/bifurcation";

export function useBifurcationsSearchQuery(filters: BifurcationListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    studentId: filters.studentId,
    className: filters.className,
    section: filters.section,
    stream: filters.stream,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    search: filters.search,
  });

  return useQuery({
    queryKey: queryKeys.bifurcations(filters),
    queryFn: () =>
      apiFetch<BifurcationSearchRow[]>(
        `/api/students/bifurcations/search${qs}`,
      ),
  });
}