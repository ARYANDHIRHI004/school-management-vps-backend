"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateAdmissionInput,
  CreateAdmissionResult,
  StudentAdmission,
  UpdateAdmissionInput,
} from "@/types/admission";

export function useCreateAdmissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateAdmissionInput) => {
      const res = await apiFetch<CreateAdmissionResult>(
        "/api/students/admissions",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export function useUpdateAdmissionMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateAdmissionInput) => {
      const res = await apiFetch<StudentAdmission>(
        `/api/students/admissions/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admission(id) });
    },
  });
}