"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type {
  CreateBifurcationInput,
  StudentBifurcation,
} from "@/types/bifurcation";

export function useCreateBifurcationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateBifurcationInput) => {
      const res = await apiFetch<StudentBifurcation>(
        "/api/students/bifurcations",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bifurcations"] });
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}