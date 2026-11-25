"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiUpload } from "@/lib/api";
import type {
  LeavingCertificateRow,
  TransferCertificateRow,
} from "@/types/certificate";

export function useUploadTransferCertificateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiUpload<TransferCertificateRow>(
        "/api/students/transfer-certificates",
        formData,
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transferCertificates"] });
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}

export function useUploadLeavingCertificateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiUpload<LeavingCertificateRow>(
        "/api/students/leaving-certificates",
        formData,
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leavingCertificates"] });
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}