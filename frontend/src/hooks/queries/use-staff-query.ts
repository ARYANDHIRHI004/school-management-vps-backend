"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch, apiFetchRaw } from "@/lib/api";
import { buildQuery } from "@/lib/build-query";
import {
  type LedgerListFilters,
  type PaySlipListFilters,
  type StaffListFilters,
  queryKeys,
} from "@/lib/query-keys";
import type {
  LedgerSummary,
  PaySlipRow,
  StaffLedgerEntry,
  StaffMember,
} from "@/types/staff";

export function useStaffListQuery(filters: StaffListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    status: filters.status,
    department: filters.department,
    designation: filters.designation,
    isTeachingStaff: filters.isTeachingStaff,
    search: filters.search,
  });

  return useQuery({
    queryKey: queryKeys.staff(filters),
    queryFn: () => apiFetch<StaffMember[]>(`/api/staff${qs}`),
  });
}

export function useStaffMemberQuery(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.staffMember(id) : ["staffMember", "none"],
    queryFn: () => apiFetch<StaffMember>(`/api/staff/${id}`),
    enabled: Boolean(id),
  });
}

export function useLedgerEntriesQuery(filters: LedgerListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    staffId: filters.staffId,
    category: filters.category,
    entryType: filters.entryType,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  return useQuery({
    queryKey: queryKeys.ledgerEntries(filters),
    queryFn: async () => {
      const payload = await apiFetchRaw<{
        data: StaffLedgerEntry[];
        meta: { page: number; limit: number; total: number };
        summary: LedgerSummary | null;
      }>(`/api/staff/ledger/entries${qs}`);
      return {
        data: payload.data,
        meta: payload.meta,
        summary: payload.summary,
      };
    },
  });
}

export function usePaySlipsQuery(filters: PaySlipListFilters) {
  const qs = buildQuery({
    page: filters.page,
    limit: filters.limit,
    staffId: filters.staffId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
  });

  return useQuery({
    queryKey: queryKeys.paySlips(filters),
    queryFn: () => apiFetch<PaySlipRow[]>(`/api/staff/pay-slips${qs}`),
  });
}