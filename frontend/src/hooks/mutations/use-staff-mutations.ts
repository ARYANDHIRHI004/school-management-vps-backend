"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch, apiUpload } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateLedgerEntryInput,
  CreateStaffInput,
  PaySlipRow,
  StaffLedgerEntry,
  StaffMember,
  UpdateStaffInput,
} from "@/types/staff";

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateStaffInput) => {
      const res = await apiFetch<StaffMember>("/api/staff", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useUpdateStaffMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateStaffInput) => {
      const res = await apiFetch<StaffMember>(`/api/staff/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.staffMember(id) });
    },
  });
}

export function useCreateLedgerEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateLedgerEntryInput) => {
      const res = await apiFetch<StaffLedgerEntry>(
        "/api/staff/ledger/entries",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ledgerEntries"] });
    },
  });
}

export function useUploadPaySlipMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiUpload<PaySlipRow>(
        "/api/staff/pay-slips",
        formData,
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["paySlips"] });
    },
  });
}