"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type {
  CreateRegistrationInput,
  StudentRegistration,
  UpdateRegistrationInput,
} from "@/types/registration";

export function useCreateRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateRegistrationInput) => {
      const res = await apiFetch<StudentRegistration>(
        "/api/students/registrations",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}

export function useUpdateRegistrationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateRegistrationInput) => {
      const res = await apiFetch<StudentRegistration>(
        `/api/students/registrations/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.registration(id),
      });
    },
  });
}
