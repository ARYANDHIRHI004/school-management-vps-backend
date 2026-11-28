"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { MarkStudentDepartureInput, StudentRecord } from "@/types/student";

export function useMarkStudentDepartureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: MarkStudentDepartureInput) => {
      const res = await apiFetch<StudentRecord>("/api/students/departures", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
      void queryClient.invalidateQueries({ queryKey: ["admission"] });
      void queryClient.invalidateQueries({ queryKey: ["departedStudents"] });
      void queryClient.invalidateQueries({ queryKey: ["studentRecords"] });
      void queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
    },
  });
}