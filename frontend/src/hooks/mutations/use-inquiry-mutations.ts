"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  ConvertInquiryInput,
  CreateInquiryInput,
  StudentInquiry,
  StudentRegistration,
  UpdateInquiryInput,
} from "@/types/inquiry";

export function useCreateInquiryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateInquiryInput) => {
      const res = await apiFetch<StudentInquiry>("/api/students/inquiries", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}

export function useUpdateInquiryMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateInquiryInput) => {
      const res = await apiFetch<StudentInquiry>(
        `/api/students/inquiries/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiry(id) });
    },
  });
}

export function useConvertInquiryMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ConvertInquiryInput) => {
      const res = await apiFetch<StudentRegistration>(
        `/api/students/inquiries/${id}/convert-registration`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inquiry(id) });
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}