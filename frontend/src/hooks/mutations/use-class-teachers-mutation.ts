"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

export function useAssignClassTeacherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      className: string;
      section: string;
      staffId: string;
      role?: "class_teacher" | "subject_teacher" | "assistant";
      subject?: string;
    }) => {
      const res = await apiFetch("/api/students/classes/teachers", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classSectionDetail"] });
    },
  });
}

export function useRemoveClassTeacherMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiFetch(`/api/students/classes/teachers/${assignmentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classSectionDetail"] });
    },
  });
}