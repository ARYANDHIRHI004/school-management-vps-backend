"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import {
  type CertificateListFilters,
  queryKeys,
} from "@/lib/query-keys";
import type {
  LeavingCertificateRow,
  TransferCertificateRow,
} from "@/types/certificate";

export function useTransferCertificatesQuery(filters: CertificateListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    studentId: filters.studentId,
  });

  return useQuery({
    queryKey: queryKeys.transferCertificates(filters),
    queryFn: () =>
      apiFetch<TransferCertificateRow[]>(
        `/api/students/transfer-certificates${qs}`,
      ),
  });
}

export function useLeavingCertificatesQuery(filters: CertificateListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    studentId: filters.studentId,
  });

  return useQuery({
    queryKey: queryKeys.leavingCertificates(filters),
    queryFn: () =>
      apiFetch<LeavingCertificateRow[]>(
        `/api/students/leaving-certificates${qs}`,
      ),
  });
}