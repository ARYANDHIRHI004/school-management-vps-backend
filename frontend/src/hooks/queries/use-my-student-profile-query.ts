"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { MyStudentPortalData } from "@/types/student";

export const myStudentProfileQueryKey = ["myStudentProfile"] as const;

export function useMyStudentProfileQuery(enabled = true) {
  return useQuery({
    queryKey: myStudentProfileQueryKey,
    queryFn: async () => {
      const res = await apiFetch<MyStudentPortalData>("/api/students/me");
      return res.data;
    },
    enabled,
  });
}