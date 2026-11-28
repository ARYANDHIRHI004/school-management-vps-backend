"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type {
  StudentParent,
  StudentParentInput,
  StudentRecord,
  UpdateStudentRecordInput,
} from "@/types/student";

export function useUpdateStudentRecordMutation(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateStudentRecordInput) => {
      const res = await apiFetch<StudentRecord>(
        `/api/students/profile/${studentId}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["studentProfile", studentId],
      });
      void queryClient.invalidateQueries({ queryKey: ["studentRecords"] });
      void queryClient.invalidateQueries({ queryKey: ["admissions"] });
      void queryClient.invalidateQueries({ queryKey: ["registrations"] });
      void queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}

export function useCreateStudentParentMutation(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: StudentParentInput) => {
      const res = await apiFetch<StudentParent>(
        `/api/students/profile/${studentId}/parents`,
        { method: "POST", body: JSON.stringify(body) },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["studentProfile", studentId],
      });
    },
  });
}

export function useUpdateStudentParentMutation(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      body,
    }: {
      parentId: string;
      body: Partial<StudentParentInput>;
    }) => {
      const res = await apiFetch<StudentParent>(
        `/api/students/parents/${parentId}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["studentProfile", studentId],
      });
    },
  });
}

export function useDeleteStudentParentMutation(studentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentId: string) => {
      await apiFetch(`/api/students/parents/${parentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["studentProfile", studentId],
      });
    },
  });
}
