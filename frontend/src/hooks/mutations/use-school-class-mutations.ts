"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { classOverviewQueryKey } from "@/hooks/queries/use-classes-query";
import type { SchoolClass, SchoolSection } from "@/types/school-class";

export function useCreateSchoolClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { name: string; sortOrder?: number }) => {
      const res = await apiFetch<SchoolClass>("/api/students/school-classes", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classOverviewQueryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicOptions });
    },
  });
}

export function useUpdateSchoolClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      sortOrder?: number;
    }) => {
      const res = await apiFetch<SchoolClass>(`/api/students/school-classes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classOverviewQueryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicOptions });
    },
  });
}

export function useDeleteSchoolClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/students/school-classes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classOverviewQueryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicOptions });
    },
  });
}

export function useCreateSchoolSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      name,
    }: {
      classId: string;
      name: string;
    }) => {
      const res = await apiFetch<SchoolSection>(
        `/api/students/school-classes/${classId}/sections`,
        {
          method: "POST",
          body: JSON.stringify({ name }),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classOverviewQueryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicOptions });
    },
  });
}

export function useUpdateSchoolSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await apiFetch<SchoolSection>(
        `/api/students/school-sections/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ name }),
        },
      );
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classOverviewQueryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicOptions });
    },
  });
}

export function useDeleteSchoolSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/students/school-sections/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classOverviewQueryKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.academicOptions });
    },
  });
}